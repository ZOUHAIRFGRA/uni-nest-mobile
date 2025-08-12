import { apiClient } from './apiClient';

/**
 * Performance monitoring service to leverage backend health checks and monitoring
 */
export class PerformanceService {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private onHealthStatusChange?: (status: HealthStatus) => void;

  /**
   * Get backend health status with performance metrics
   */
  async getHealthStatus(): Promise<HealthStatus> {
    try {
      const response = await apiClient.get<HealthResponse>('/health');
      return {
        status: response.status,
        isHealthy: response.status === 'OK',
        timestamp: response.timestamp,
        uptime: response.uptime,
        environment: response.environment,
        performance: {
          memoryUsage: response.performance?.memoryUsage,
          cpuUsage: response.performance?.cpuUsage,
          nodeVersion: response.performance?.nodeVersion,
        },
        database: response.database,
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'ERROR',
        isHealthy: false,
        timestamp: new Date().toISOString(),
        uptime: 0,
        environment: 'unknown',
        performance: null,
        database: { connected: false },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Start periodic health monitoring
   */
  startHealthMonitoring(
    intervalMs: number = 30000, // 30 seconds
    onStatusChange?: (status: HealthStatus) => void
  ) {
    this.onHealthStatusChange = onStatusChange;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getHealthStatus();
        this.onHealthStatusChange?.(health);
      } catch (error) {
        console.error('Health monitoring error:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Check if backend caching is working properly
   */
  async checkCachePerformance(): Promise<CachePerformanceMetrics> {
    const startTime = Date.now();
    
    try {
      // Make the same request twice to test caching
      const firstRequest = Date.now();
      await apiClient.get('/landlord/dashboard/stats');
      const firstRequestTime = Date.now() - firstRequest;

      // Wait a small amount and make the same request again
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const secondRequest = Date.now();
      await apiClient.get('/landlord/dashboard/stats');
      const secondRequestTime = Date.now() - secondRequest;

      const totalTime = Date.now() - startTime;
      const performanceGain = firstRequestTime > 0 ? 
        ((firstRequestTime - secondRequestTime) / firstRequestTime) * 100 : 0;

      return {
        firstRequestTime,
        secondRequestTime,
        totalTime,
        performanceGain,
        isCacheWorking: secondRequestTime < firstRequestTime * 0.8, // 20% faster indicates caching
      };
    } catch (error) {
      return {
        firstRequestTime: 0,
        secondRequestTime: 0,
        totalTime: Date.now() - startTime,
        performanceGain: 0,
        isCacheWorking: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test property details endpoint performance
   */
  async testPropertyDetailsPerformance(propertyId: string): Promise<PropertyDetailsMetrics> {
    const startTime = Date.now();
    
    try {
      const response: any = await apiClient.get(`/api/properties/${propertyId}`);
      const responseTime = Date.now() - startTime;
      
      // Check if response has expected structure
      const hasProperty = !!(response.property || response.data || response._id);
      const fromCache = !!response.fromCache;
      
      return {
        responseTime,
        isOptimal: responseTime < 300, // Under 300ms is optimal for details
        hasValidData: hasProperty,
        fromCache,
        propertyId,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        responseTime,
        isOptimal: false,
        hasValidData: false,
        fromCache: false,
        propertyId,
        error: error.message || 'Property details fetch failed',
      };
    }
  }

  /**
   * Test search performance with rate limiting awareness
   */
  async testSearchPerformance(query: string): Promise<SearchPerformanceMetrics> {
    const startTime = Date.now();
    
    try {
      const response : any = await apiClient.get('/api/properties/search', { q: query, limit: 1 });
      const responseTime = Date.now() - startTime;
      
      return {
        responseTime,
        isOptimal: responseTime < 500, // Under 500ms is optimal
        rateLimitHit: false,
        resultsCount: Array.isArray(response.properties) ? response.properties.length : 0,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const isRateLimit = error.message?.includes('Too many search requests');
      
      return {
        responseTime,
        isOptimal: false,
        rateLimitHit: isRateLimit,
        resultsCount: 0,
        error: error.message || 'Search failed',
      };
    }
  }

  /**
   * Get comprehensive performance report
   */
  async getPerformanceReport(): Promise<PerformanceReport> {
    const health = await this.getHealthStatus();
    const cacheMetrics = await this.checkCachePerformance();
    const searchMetrics = await this.testSearchPerformance('test');

    return {
      timestamp: new Date().toISOString(),
      health,
      cache: cacheMetrics,
      search: searchMetrics,
      overallScore: this.calculatePerformanceScore(health, cacheMetrics, searchMetrics),
    };
  }

  private calculatePerformanceScore(
    health: HealthStatus,
    cache: CachePerformanceMetrics,
    search: SearchPerformanceMetrics
  ): number {
    let score = 0;
    
    // Health score (40%)
    if (health.isHealthy) score += 40;
    
    // Cache performance score (30%)
    if (cache.isCacheWorking) score += 30;
    else if (cache.performanceGain > 0) score += 15;
    
    // Search performance score (30%)
    if (search.isOptimal && !search.rateLimitHit) score += 30;
    else if (search.responseTime < 1000) score += 15;
    
    return Math.min(100, score);
  }
}

// Types for performance monitoring
export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  performance?: {
    memoryUsage?: {
      rss: string;
      heapTotal: string;
      heapUsed: string;
      external: string;
      arrayBuffers: string;
    };
    cpuUsage?: {
      user: number;
      system: number;
    };
    nodeVersion?: string;
  };
  database: {
    connected: boolean;
    collections?: number;
  };
}

export interface HealthStatus {
  status: string;
  isHealthy: boolean;
  timestamp: string;
  uptime: number;
  environment: string;
  performance: {
    memoryUsage?: any;
    cpuUsage?: any;
    nodeVersion?: string;
  } | null;
  database: {
    connected: boolean;
    collections?: number;
  };
  error?: string;
}

export interface CachePerformanceMetrics {
  firstRequestTime: number;
  secondRequestTime: number;
  totalTime: number;
  performanceGain: number;
  isCacheWorking: boolean;
  error?: string;
}

export interface SearchPerformanceMetrics {
  responseTime: number;
  isOptimal: boolean;
  rateLimitHit: boolean;
  resultsCount: number;
  error?: string;
}

export interface PropertyDetailsMetrics {
  responseTime: number;
  isOptimal: boolean;
  hasValidData: boolean;
  fromCache: boolean;
  propertyId: string;
  error?: string;
}

export interface PerformanceReport {
  timestamp: string;
  health: HealthStatus;
  cache: CachePerformanceMetrics;
  search: SearchPerformanceMetrics;
  overallScore: number;
}

export const performanceService = new PerformanceService();
