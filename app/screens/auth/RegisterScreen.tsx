import React, { useState, useEffect, useRef } from 'react';
import { Animated, Easing, useColorScheme, Platform, TouchableOpacity ,ScrollView, KeyboardAvoidingView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Center } from '../../../components/ui/center';
import { Button, ButtonText } from '../../../components/ui/button';
import { VStack } from '../../../components/ui/vstack';
import { Text } from '../../../components/ui/text';
import { Box } from '../../../components/ui/box';
import { HStack } from '../../../components/ui/hstack';
import { Input, InputField } from '../../../components/ui/input';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/authService';
import { Link, LinkText } from '../../../components/ui/link';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getTheme } from '../../utils/theme';
import { MOROCCAN_UNIVERSITIES, STUDY_FIELDS } from '../../utils/constants';
import { AlertCircle, ArrowDownToDot, Info, X } from 'lucide-react-native';
import { Switch } from 'react-native-gesture-handler';

const steps = ['Role', 'Personal', 'University', 'Preferences', 'Lifestyle', 'Photo'];

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const currentTheme = getTheme(colorScheme || 'light');
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<'Student' | 'Landlord'>('Student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Personal info state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [cin, setCIN] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDOB] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Other');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // University info state
  const [university, setUniversity] = useState('');
  const [studyField, setStudyField] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState<number | null>(null);

  // Preferences state
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [preferredAreas, setPreferredAreas] = useState('');
  const [maxCommuteTime, setMaxCommuteTime] = useState('');
  const [amenities, setAmenities] = useState({
    wifi: false,
    parking: false,
    laundry: false,
    gym: false,
    security: false,
    furnished: false,
  });
  const [roomType, setRoomType] = useState('');

  // Lifestyle state
  const [smokingHabits, setSmokingHabits] = useState('No');
  const [alcoholConsumption, setAlcoholConsumption] = useState('No');
  const [petFriendly, setPetFriendly] = useState(false);
  const [sleepSchedule, setSleepSchedule] = useState('Flexible');
  const [socialLevel, setSocialLevel] = useState('Moderate');
  const [cleanlinessLevel, setCleanlinessLevel] = useState('Moderate');
  const [noiseLevel, setNoiseLevel] = useState('Moderate');
  const [guestPolicy, setGuestPolicy] = useState('Occasionally');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade-in for each step
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
    return () => {
      fadeAnim.setValue(0); // Reset animation on step change
    };
  }, [step]);

  // Button press animation
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Email validation
  const isValidEmail = (val: string) => /.+@.+\..+/.test(val);

  // Navigation handlers
  const next = async () => {
    setError(null);
    animateButton();
    if (step === 0) {
      setStep(step + 1);
      return;
    }
    if (step === 1) {
      if (!firstName || !lastName || !email || !password) {
        setError('All required fields must be filled.');
        return;
      }
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }
      setStep(step + 1);
      return;
    }
    if (step === 2 && role === 'Student') {
      if (!university || !studyField || !yearOfStudy) {
        setError('Please complete all university information.');
        return;
      }
      setStep(step + 1);
      return;
    }
    setStep(step + 1);
  };

  const prev = () => {
    animateButton();
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    animateButton();
    try {
      await authService.register({
        firstName,
        lastName,
        email,
        password,
        phone,
        cin,
        address,
        dob,
        gender,
        role,
        university: role === 'Student' ? university : undefined,
        studyField: role === 'Student' ? studyField : undefined,
        yearOfStudy: role === 'Student' ? yearOfStudy ?? undefined : undefined,
        preferences: {
          budget: { min: Number(budgetMin) || 0, max: Number(budgetMax) || 0 },
          preferredAreas: preferredAreas.split(',').map((a) => a.trim()).filter(Boolean),
          maxCommuteTime: Number(maxCommuteTime) || 0,
          amenities,
          roomType,
        },
        lifestyle: {
          smokingHabits,
          alcoholConsumption,
          petFriendly,
          sleepSchedule,
          socialLevel,
          cleanlinessLevel,
          noiseLevel,
          guestPolicy,
        },
      });
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <VStack space="lg" style={{ width: '100%' }}>
            <Text
              size="3xl"
              style={{
                fontFamily: currentTheme.typography.fontFamily,
                fontWeight: currentTheme.typography.weights.bold as import('react-native').TextStyle['fontWeight'],
                color: currentTheme.colors.text.primary,
              }}
              accessible
              accessibilityRole="header"
              accessibilityLabel="Select your role"
            >
              Select Your Role
            </Text>
            <HStack space="md" style={{ width: '100%' }}>
              <Button
                action={role === 'Student' ? 'primary' : 'secondary'}
                size="lg"
                style={{
                  flex: 1,
                  borderRadius: currentTheme.borderRadius.button,
                  backgroundColor: role === 'Student' ? currentTheme.colors.primary : currentTheme.colors.card,
                }}
                onPress={() => setRole('Student')}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Select Student role"
              >
                <HStack space="sm" style={{ alignItems: 'center' }}>
                  <Text size="xl" style={{ color: currentTheme.colors.text.primary }}>
                    🎓
                  </Text>
                  <ButtonText
                    size="md"
                    style={{
                      fontFamily: currentTheme.typography.fontFamily,
                      color: role === 'Student' ? currentTheme.colors.text.primary : currentTheme.colors.text.primary,
                    }}
                    allowFontScaling
                  >
                    Student
                  </ButtonText>
                </HStack>
              </Button>
              <Button
                action={role === 'Landlord' ? 'primary' : 'secondary'}
                size="lg"
                style={{
                  flex: 1,
                  borderRadius: currentTheme.borderRadius.button,
                  backgroundColor: role === 'Landlord' ? currentTheme.colors.primary : currentTheme.colors.card,
                }}
                onPress={() => setRole('Landlord')}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Select Landlord role"
              >
                <HStack space="sm" style={{ alignItems: 'center' }}>
                  <Text size="xl" style={{ color: currentTheme.colors.text.primary }}>
                    🏠
                  </Text>
                  <ButtonText
                    size="md"
                    style={{
                      fontFamily: currentTheme.typography.fontFamily,
                      color: role === 'Landlord' ? currentTheme.colors.text.primary : currentTheme.colors.text.primary,
                    }}
                    allowFontScaling
                  >
                    Landlord
                  </ButtonText>
                </HStack>
              </Button>
            </HStack>
          </VStack>
        );
      case 1:
        return (
          <VStack space="lg" style={{ width: '100%' }}>
            <Text
              size="3xl"
              style={{
                fontFamily: currentTheme.typography.fontFamily,
                fontWeight: currentTheme.typography.weights.bold as import('react-native').TextStyle['fontWeight'],
                color: currentTheme.colors.text.primary,
              }}
              accessible
              accessibilityRole="header"
              accessibilityLabel="Enter your personal information"
            >
              Personal Information
            </Text>
            <Box>
              <Text
                size="md"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  marginBottom: currentTheme.spacing.sm,
                }}
                allowFontScaling
              >
                Required Fields
              </Text>
              <VStack space="sm">
                <Input
                  style={{
                    backgroundColor: currentTheme.colors.input,
                    borderRadius: currentTheme.borderRadius.input,
                    borderColor: currentTheme.colors.border,
                  }}
                  accessible
                  accessibilityLabel="First Name"
                >
                  <InputField
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First Name"
                    placeholderTextColor={currentTheme.colors.placeholder}
                    style={{ fontFamily: currentTheme.typography.fontFamily }}
                    allowFontScaling
                  />
                </Input>
                <Input
                  style={{
                    backgroundColor: currentTheme.colors.input,
                    borderRadius: currentTheme.borderRadius.input,
                    borderColor: currentTheme.colors.border,
                  }}
                  accessible
                  accessibilityLabel="Last Name"
                >
                  <InputField
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last Name"
                    placeholderTextColor={currentTheme.colors.placeholder}
                    style={{ fontFamily: currentTheme.typography.fontFamily }}
                    allowFontScaling
                  />
                </Input>
                <Input
                  style={{
                    backgroundColor: currentTheme.colors.input,
                    borderRadius: currentTheme.borderRadius.input,
                    borderColor: currentTheme.colors.border,
                  }}
                  accessible
                  accessibilityLabel="Email Address"
                >
                  <InputField
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Email"
                    placeholderTextColor={currentTheme.colors.placeholder}
                    style={{ fontFamily: currentTheme.typography.fontFamily }}
                    allowFontScaling
                  />
                </Input>
                <Input
                  style={{
                    backgroundColor: currentTheme.colors.input,
                    borderRadius: currentTheme.borderRadius.input,
                    borderColor: currentTheme.colors.border,
                  }}
                  accessible
                  accessibilityLabel="Password"
                >
                  <InputField
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Password"
                    placeholderTextColor={currentTheme.colors.placeholder}
                    style={{ fontFamily: currentTheme.typography.fontFamily }}
                    allowFontScaling
                  />
                </Input>
              </VStack>
            </Box>
            <Box>
              <Text
                size="md"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  marginBottom: currentTheme.spacing.sm,
                }}
                allowFontScaling
              >
                Optional Fields
              </Text>
              <VStack space="sm">
                <Input
                  style={{
                    backgroundColor: currentTheme.colors.input,
                    borderRadius: currentTheme.borderRadius.input,
                    borderColor: currentTheme.colors.border,
                  }}
                  accessible
                  accessibilityLabel="Phone Number"
                >
                  <InputField
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Phone (optional)"
                    placeholderTextColor={currentTheme.colors.placeholder}
                    style={{ fontFamily: currentTheme.typography.fontFamily }}
                    allowFontScaling
                  />
                </Input>
                <Input
                  style={{
                    backgroundColor: currentTheme.colors.input,
                    borderRadius: currentTheme.borderRadius.input,
                    borderColor: currentTheme.colors.border,
                  }}
                  accessible
                  accessibilityLabel="CIN"
                >
                  <InputField
                    value={cin}
                    onChangeText={setCIN}
                    placeholder="CIN (optional)"
                    placeholderTextColor={currentTheme.colors.placeholder}
                    style={{ fontFamily: currentTheme.typography.fontFamily }}
                    allowFontScaling
                  />
                </Input>
                <Input
                  style={{
                    backgroundColor: currentTheme.colors.input,
                    borderRadius: currentTheme.borderRadius.input,
                    borderColor: currentTheme.colors.border,
                  }}
                  accessible
                  accessibilityLabel="Address"
                >
                  <InputField
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Address (optional)"
                    placeholderTextColor={currentTheme.colors.placeholder}
                    style={{ fontFamily: currentTheme.typography.fontFamily }}
                    allowFontScaling
                  />
                </Input>
                <Box>
                  <Text
                    size="sm"
                    style={{
                      fontFamily: currentTheme.typography.fontFamily,
                      color: currentTheme.colors.text.secondary,
                      marginBottom: currentTheme.spacing.xs,
                    }}
                    allowFontScaling
                  >
                    Date of Birth (optional)
                  </Text>
                  <Button
                    variant="outline"
                    action="secondary"
                    style={{ borderRadius: currentTheme.borderRadius.button }}
                    onPress={() => setShowDatePicker(true)}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Select Date of Birth"
                  >
                    <ButtonText
                      size="md"
                      style={{
                        fontFamily: currentTheme.typography.fontFamily,
                        color: currentTheme.colors.text.primary,
                      }}
                      allowFontScaling
                    >
                      {dob ? dob : 'Select Date'}
                    </ButtonText>
                  </Button>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dob ? new Date(dob) : new Date(2000, 0, 1)}
                      mode="date"
                      display="default"
                      onChange={(event: any, selectedDate?: Date) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDOB(selectedDate.toISOString().split('T')[0]);
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </Box>
                <Box>
                  <Text
size="sm"
                    style={{
                      fontFamily: currentTheme.typography.fontFamily,
                      color: currentTheme.colors.text.secondary,
                      marginBottom: currentTheme.spacing.xs,
                    }}
                    allowFontScaling
                  >
                    Gender (optional)
                  </Text>
                  <Box
                    style={{
                      backgroundColor: currentTheme.colors.input,
                      borderRadius: currentTheme.borderRadius.input,
                      borderWidth: 1,
                      borderColor: currentTheme.colors.border,
                    }}
                  >
                    <Picker
                      selectedValue={gender}
                      onValueChange={setGender}
                      style={{ color: currentTheme.colors.text.primary }}
                      accessible
                      accessibilityLabel="Select Gender"
                    >
                      <Picker.Item label="Select gender..." value="" />
                      <Picker.Item label="Male" value="Male" />
                      <Picker.Item label="Female" value="Female" />
                      <Picker.Item label="Other" value="Other" />
                    </Picker>
                  </Box>
                </Box>
              </VStack>
            </Box>
          </VStack>
        );
      case 2:
        if (role === 'Student') {
          return (
            <VStack space="lg" style={{ width: '100%' }}>
              <Text
                size="3xl"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  fontWeight: currentTheme.typography.weights.bold as import('react-native').TextStyle['fontWeight'],
                  color: currentTheme.colors.text.primary,
                }}
                accessible
                accessibilityRole="header"
                accessibilityLabel="Enter your university information"
              >
                University Information
              </Text>
              <Box>
                <Text
                  size="sm"
                  style={{
                    fontFamily: currentTheme.typography.fontFamily,
                    color: currentTheme.colors.text.secondary,
                    marginBottom: currentTheme.spacing.xs,
                  }}
                  allowFontScaling
                >
                  University
                </Text>
                <Box
                  style={{
                    backgroundColor: currentTheme.colors.input,
                    borderRadius: currentTheme.borderRadius.input,
                    borderWidth: 1,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <Picker
                    selectedValue={university}
                    onValueChange={setUniversity}
                    style={{ color: currentTheme.colors.text.primary }}
                    accessible
                    accessibilityLabel="Select University"
                  >
                    <Picker.Item label="Select university..." value="" />
                    {MOROCCAN_UNIVERSITIES.map((u) => (
                      <Picker.Item key={u} label={u} value={u} />
                    ))}
                  </Picker>
                </Box>
              </Box>
              <Box>
                <Text
                  size="sm"
                  style={{
                    fontFamily: currentTheme.typography.fontFamily,
                    color: currentTheme.colors.text.secondary,
                    marginBottom: currentTheme.spacing.xs,
                  }}
                  allowFontScaling
                >
                  Field of Study
                </Text>
                <Box
                  style={{
                    backgroundColor: currentTheme.colors.input,
                    borderRadius: currentTheme.borderRadius.input,
                    borderWidth: 1,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <Picker
                    selectedValue={studyField}
                    onValueChange={setStudyField}
                    style={{ color: currentTheme.colors.text.primary }}
                    accessible
                    accessibilityLabel="Select Field of Study"
                  >
                    <Picker.Item label="Select field..." value="" />
                    {STUDY_FIELDS.map((f) => (
                      <Picker.Item key={f} label={f} value={f} />
                    ))}
                  </Picker>
                </Box>
              </Box>
              <Box>
                <Text
                  size="sm"
                  style={{
                    fontFamily: currentTheme.typography.fontFamily,
                    color: currentTheme.colors.text.secondary,
                    marginBottom: currentTheme.spacing.xs,
                  }}
                  allowFontScaling
                >
                  Year of Study
                </Text>
                <Box
                  style={{
                    backgroundColor: currentTheme.colors.input,
                    borderRadius: currentTheme.borderRadius.input,
                    borderWidth: 1,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <Picker
                    selectedValue={yearOfStudy ?? ''}
                    onValueChange={(v) => setYearOfStudy(v ? Number(v) : null)}
                    style={{ color: currentTheme.colors.text.primary }}
                    accessible
                    accessibilityLabel="Select Year of Study"
                  >
                    <Picker.Item label="Select year..." value="" />
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <Picker.Item key={y} label={y.toString()} value={y} />
                    ))}
                  </Picker>
                </Box>
              </Box>
            </VStack>
          );
        } else {
          return (
            <VStack space="lg" style={{ width: '100%' }}>
              <Text
                size="3xl"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  fontWeight: currentTheme.typography.weights.bold as import('react-native').TextStyle['fontWeight'],
                  color: currentTheme.colors.text.primary,
                }}
                accessible
                accessibilityRole="header"
                accessibilityLabel="University Information"
              >
                University Information
              </Text>
              <Text
                size="md"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                }}
                allowFontScaling
              >
                No university info required for landlords. Click Next to continue.
              </Text>
            </VStack>
          );
        }
      case 3:
        return (
          <VStack space="lg" style={{ width: '100%' }}>
            <Text
              size="3xl"
              style={{
                fontFamily: currentTheme.typography.fontFamily,
                fontWeight: currentTheme.typography.weights.bold as import('react-native').TextStyle['fontWeight'],
                color: currentTheme.colors.text.primary,
              }}
              accessible
              accessibilityRole="header"
              accessibilityLabel="Enter your housing preferences"
            >
              Housing Preferences
            </Text>
            <Box>
              <Text
                size="sm"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  marginBottom: currentTheme.spacing.xs,
                }}
                allowFontScaling
              >
                Budget Range (MAD)
              </Text>
              <HStack space="sm">
                <Input
                  style={{
                    flex: 1,
                    backgroundColor: currentTheme.colors.input,
                    borderRadius: currentTheme.borderRadius.input,
                    borderColor: currentTheme.colors.border,
                  }}
                  accessible
                  accessibilityLabel="Minimum Budget"
                >
                  <InputField
                    value={budgetMin}
                    onChangeText={setBudgetMin}
                    keyboardType="numeric"
                    placeholder="Min"
                    placeholderTextColor={currentTheme.colors.placeholder}
                    style={{ fontFamily: currentTheme.typography.fontFamily }}
                    allowFontScaling
                  />
                </Input>
                <Input
                  style={{
                    flex: 1,
                    backgroundColor: currentTheme.colors.input,
                    borderRadius: currentTheme.borderRadius.input,
                    borderColor: currentTheme.colors.border,
                  }}
                  accessible
                  accessibilityLabel="Maximum Budget"
                >
                  <InputField
                    value={budgetMax}
                    onChangeText={setBudgetMax}
                    keyboardType="numeric"
                    placeholder="Max"
                    placeholderTextColor={currentTheme.colors.placeholder}
                    style={{ fontFamily: currentTheme.typography.fontFamily }}
                    allowFontScaling
                  />
                </Input>
              </HStack>
            </Box>
            <Box>
              <HStack space="xs" style={{ alignItems: 'center', marginBottom: currentTheme.spacing.xs }}>
                <Text
                  size="sm"
                  style={{
                    fontFamily: currentTheme.typography.fontFamily,
                    color: currentTheme.colors.text.secondary,
                  }}
                  allowFontScaling
                >
                  Preferred Areas
                </Text>
                <TouchableOpacity
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Learn about preferred areas format"
                >
                  <Info size={16} color={currentTheme.colors.text.secondary} />
                </TouchableOpacity>
              </HStack>
              <Input
                style={{
                  backgroundColor: currentTheme.colors.input,
                  borderRadius: currentTheme.borderRadius.input,
                  borderColor: currentTheme.colors.border,
                }}
                accessible
                accessibilityLabel="Preferred Areas"
              >
                <InputField
                  value={preferredAreas}
                  onChangeText={setPreferredAreas}
                  placeholder="e.g., Agdal, Hay Riad"
                  placeholderTextColor={currentTheme.colors.placeholder}
                  style={{ fontFamily: currentTheme.typography.fontFamily }}
                  allowFontScaling
                />
              </Input>
            </Box>
            <Box>
              <Text
                size="sm"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  marginBottom: currentTheme.spacing.xs,
                }}
                allowFontScaling
              >
                Max Commute Time (min)
              </Text>
              <Input
                style={{
                  backgroundColor: currentTheme.colors.input,
                  borderRadius: currentTheme.borderRadius.input,
                  borderColor: currentTheme.colors.border,
                }}
                accessible
                accessibilityLabel="Maximum Commute Time"
              >
                <InputField
                  value={maxCommuteTime}
                  onChangeText={setMaxCommuteTime}
                  keyboardType="numeric"
                  placeholder="e.g., 30"
                  placeholderTextColor={currentTheme.colors.placeholder}
                  style={{ fontFamily: currentTheme.typography.fontFamily }}
                  allowFontScaling
                />
              </Input>
            </Box>
            <Box>
              <Text
                size="sm"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  marginBottom: currentTheme.spacing.xs,
                }}
                allowFontScaling
              >
                Amenities
              </Text>
              <HStack space="sm" style={{ flexWrap: 'wrap' }}>
                {Object.keys(amenities).map((key) => (
                  <Box key={key} style={{ flexDirection: 'row', alignItems: 'center', marginRight: currentTheme.spacing.md, marginBottom: currentTheme.spacing.sm }}>
                    <Switch
                      value={amenities[key as keyof typeof amenities]}
                      onValueChange={(v) => setAmenities((a) => ({ ...a, [key]: v }))}
                      trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary }}
                      thumbColor={currentTheme.colors.card}
                      accessible
                      accessibilityLabel={`Toggle ${key} amenity`}
                    />
                    <Text
                      size="sm"
                      style={{
                        fontFamily: currentTheme.typography.fontFamily,
                        color: currentTheme.colors.text.primary,
                        marginLeft: currentTheme.spacing.xs,
                        textTransform: 'capitalize',
                      }}
                      allowFontScaling
                    >
                      {key}
                    </Text>
                  </Box>
                ))}
              </HStack>
            </Box>
            <Box>
              <Text
                size="sm"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  marginBottom: currentTheme.spacing.xs,
                }}
                allowFontScaling
              >
                Room Type
              </Text>
              <Box
                style={{
                  backgroundColor: currentTheme.colors.input,
                  borderRadius: currentTheme.borderRadius.input,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Picker
                  selectedValue={roomType}
                  onValueChange={setRoomType}
                  style={{ color: currentTheme.colors.text.primary }}
                  accessible
                  accessibilityLabel="Select Room Type"
                >
                  <Picker.Item label="Select room type..." value="" />
                  <Picker.Item label="Private" value="Private" />
                  <Picker.Item label="Shared" value="Shared" />
                  <Picker.Item label="Studio" value="Studio" />
                  <Picker.Item label="Apartment" value="Apartment" />
                </Picker>
              </Box>
            </Box>
          </VStack>
        );
      case 4:
        return (
          <VStack space="lg" style={{ width: '100%' }}>
            <Text
              size="3xl"
              style={{
                fontFamily: currentTheme.typography.fontFamily,
                fontWeight: currentTheme.typography.weights.bold as import('react-native').TextStyle['fontWeight'],
                color: currentTheme.colors.text.primary,
              }}
              accessible
              accessibilityRole="header"
              accessibilityLabel="Enter your lifestyle preferences"
            >
              Lifestyle Preferences
            </Text>
            <Box>
              <Text
                size="sm"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  marginBottom: currentTheme.spacing.xs,
                }}
                allowFontScaling
              >
                Smoking Habits
              </Text>
              <Box
                style={{
                  backgroundColor: currentTheme.colors.input,
                  borderRadius: currentTheme.borderRadius.input,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Picker
                  selectedValue={smokingHabits}
                  onValueChange={setSmokingHabits}
                  style={{ color: currentTheme.colors.text.primary }}
                  accessible
                  accessibilityLabel="Select Smoking Habits"
                >
                  <Picker.Item label="No" value="No" />
                  <Picker.Item label="Occasionally" value="Occasionally" />
                  <Picker.Item label="Yes" value="Yes" />
                </Picker>
              </Box>
            </Box>
            <Box>
              <Text
                size="sm"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  marginBottom: currentTheme.spacing.xs,
                }}
                allowFontScaling
              >
                Alcohol Consumption
              </Text>
              <Box
                style={{
                  backgroundColor: currentTheme.colors.input,
                  borderRadius: currentTheme.borderRadius.input,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Picker
                  selectedValue={alcoholConsumption}
                  onValueChange={setAlcoholConsumption}
                  style={{ color: currentTheme.colors.text.primary }}
                  accessible
                  accessibilityLabel="Select Alcohol Consumption"
                >
                  <Picker.Item label="No" value="No" />
                  <Picker.Item label="Occasionally" value="Occasionally" />
                  <Picker.Item label="Yes" value="Yes" />
                </Picker>
              </Box>
            </Box>
            <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                size="sm"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  marginRight: currentTheme.spacing.xs,
                }}
                allowFontScaling
              >
                Pet Friendly
              </Text>
              <Switch
                value={petFriendly}
                onValueChange={setPetFriendly}
                trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary }}
                thumbColor={currentTheme.colors.card}
                accessible
                accessibilityLabel="Toggle Pet Friendly"
              />
            </Box>
            <Box>
              <Text
                size="sm"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  marginBottom: currentTheme.spacing.xs,
                }}
                allowFontScaling
              >
                Sleep Schedule
              </Text>
              <Box
                style={{
                  backgroundColor: currentTheme.colors.input,
                  borderRadius: currentTheme.borderRadius.input,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Picker
                  selectedValue={sleepSchedule}
                  onValueChange={setSleepSchedule}
                  style={{ color: currentTheme.colors.text.primary }}
                  accessible
                  accessibilityLabel="Select Sleep Schedule"
                >
                  <Picker.Item label="Early" value="Early" />
                  <Picker.Item label="Late" value="Late" />
                  <Picker.Item label="Flexible" value="Flexible" />
                </Picker>
              </Box>
            </Box>
            <Box>
              <Text
                size="sm"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  marginBottom: currentTheme.spacing.xs,
                }}
                allowFontScaling
              >
                Social Level
              </Text>
              <Box
                style={{
                  backgroundColor: currentTheme.colors.input,
                  borderRadius: currentTheme.borderRadius.input,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Picker
                  selectedValue={socialLevel}
                  onValueChange={setSocialLevel}
                  style={{ color: currentTheme.colors.text.primary }}
                  accessible
                  accessibilityLabel="Select Social Level"
                >
                  <Picker.Item label="Introvert" value="Introvert" />
                  <Picker.Item label="Moderate" value="Moderate" />
                  <Picker.Item label="Extrovert" value="Extrovert" />
                </Picker>
              </Box>
            </Box>
            <Box>
              <Text
                size="sm"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  marginBottom: currentTheme.spacing.xs,
                }}
                allowFontScaling
              >
                Cleanliness Level
              </Text>
              <Box
                style={{
                  backgroundColor: currentTheme.colors.input,
                  borderRadius: currentTheme.borderRadius.input,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Picker
                  selectedValue={cleanlinessLevel}
                  onValueChange={setCleanlinessLevel}
                  style={{ color: currentTheme.colors.text.primary }}
                  accessible
                  accessibilityLabel="Select Cleanliness Level"
                >
                  <Picker.Item label="Low" value="Low" />
                  <Picker.Item label="Moderate" value="Moderate" />
                  <Picker.Item label="High" value="High" />
                </Picker>
              </Box>
            </Box>
            <Box>
              <Text
                size="sm"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  marginBottom: currentTheme.spacing.xs,
                }}
                allowFontScaling
              >
                Noise Level
              </Text>
              <Box
                style={{
                  backgroundColor: currentTheme.colors.input,
                  borderRadius: currentTheme.borderRadius.input,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Picker
                  selectedValue={noiseLevel}
                  onValueChange={setNoiseLevel}
                  style={{ color: currentTheme.colors.text.primary }}
                  accessible
                  accessibilityLabel="Select Noise Level"
                >
                  <Picker.Item label="Low" value="Low" />
                  <Picker.Item label="Moderate" value="Moderate" />
                  <Picker.Item label="High" value="High" />
                </Picker>
              </Box>
            </Box>
            <Box>
              <Text
                size="sm"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.text.secondary,
                  marginBottom: currentTheme.spacing.xs,
                }}
                allowFontScaling
              >
                Guest Policy
              </Text>
              <Box
                style={{
                  backgroundColor: currentTheme.colors.input,
                  borderRadius: currentTheme.borderRadius.input,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Picker
                  selectedValue={guestPolicy}
                  onValueChange={setGuestPolicy}
                  style={{ color: currentTheme.colors.text.primary }}
                  accessible
                  accessibilityLabel="Select Guest Policy"
                >
                  <Picker.Item label="Never" value="Never" />
                  <Picker.Item label="Occasionally" value="Occasionally" />
                  <Picker.Item label="Frequently" value="Frequently" />
                </Picker>
              </Box>
            </Box>
          </VStack>
        );
      case 5:
        return (
          <VStack space="lg" style={{ width: '100%' }}>
            <Text
              size="3xl"
              style={{
                fontFamily: currentTheme.typography.fontFamily,
                fontWeight: currentTheme.typography.weights.bold as import('react-native').TextStyle['fontWeight'],
                color: currentTheme.colors.text.primary,
              }}
              accessible
              accessibilityRole="header"
              accessibilityLabel="Upload your profile photo"
            >
              Profile Photo
            </Text>
            <Text
              size="md"
              style={{
                fontFamily: currentTheme.typography.fontFamily,
                color: currentTheme.colors.text.secondary,
              }}
              allowFontScaling
            >
              Profile photo upload coming soon. Click Finish to complete registration.
            </Text>
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: currentTheme.spacing.md }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Center style={{ marginVertical: currentTheme.spacing.lg }}>
            <LinearGradient
              colors={[`${currentTheme.colors.primary}B3`, `${currentTheme.colors.secondary}B3`]}
              style={{
                width: 80,
                height: 80,
                borderRadius: currentTheme.borderRadius.round,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: currentTheme.spacing.md,
                ...currentTheme.shadows.medium,
                elevation: 8,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
            <ArrowDownToDot size={40} color={currentTheme.colors.text.primary} />
            </LinearGradient>
            <Text
              size="3xl"
              style={{
                fontFamily: currentTheme.typography.fontFamily,
                fontWeight: '700',
                color: currentTheme.colors.text.primary,
                marginBottom: currentTheme.spacing.xs,
              }}
              accessible
              accessibilityRole="header"
              accessibilityLabel="Register for Match & Settle"
              allowFontScaling
            >
              Create Your Account
            </Text>
            <Text
              size="md"
              style={{
                fontFamily: currentTheme.typography.fontFamily,
                color: currentTheme.colors.text.secondary,
                textAlign: 'center',
                lineHeight: currentTheme.spacing.lg,
              }}
              allowFontScaling
            >
              Join {role === 'Student' ? 'as a student to find your ideal home' : 'as a landlord to list your properties'}
            </Text>
          </Center>
          {/* Form Container */}
          <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
            <Box
              style={{
                backgroundColor: currentTheme.colors.card,
                borderRadius: currentTheme.borderRadius.card,
                padding: currentTheme.spacing.lg,
                marginBottom: currentTheme.spacing.lg,
                ...currentTheme.shadows.medium,
                elevation: 6,
              }}
            >
      {/* Progress Indicator */}
              <HStack space="sm" style={{ marginBottom: currentTheme.spacing.lg }}>
        {steps.map((label, idx) => (
          <Box
            key={label}
                    style={{
                      height: 8,
                      flex: 1,
                      borderRadius: currentTheme.borderRadius.round,
                      backgroundColor: idx <= step ? currentTheme.colors.primary : currentTheme.colors.border,
                    }}
                    accessible
                    accessibilityLabel={`Step ${idx + 1} of ${steps.length}: ${label}`}
          />
        ))}
      </HStack>
      {/* Step Content */}
              <Box style={{ width: '100%', marginBottom: currentTheme.spacing.lg }}>{renderStep()}</Box>
              {/* Error Message */}
              {error && (
                <TouchableOpacity
                  onPress={() => setError(null)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: `${currentTheme.colors.error}20`,
                    borderRadius: currentTheme.borderRadius.medium,
                    padding: currentTheme.spacing.sm,
                    marginBottom: currentTheme.spacing.md,
                  }}
                  accessible
                  accessibilityRole="alert"
                  accessibilityLabel={error}
                  accessibilityHint="Tap to dismiss error"
                >
                  <AlertCircle
                    size={20}
                    color={currentTheme.colors.error}
                    style={{ marginRight: currentTheme.spacing.sm }}
                  />
                  <Text
                    size="sm"
                    style={{
                      fontFamily: currentTheme.typography.fontFamily,
                      color: currentTheme.colors.error,
                      flex: 1,
                    }}
                    allowFontScaling
                  >
                    {error}
                  </Text>
                  <X size={20} color={currentTheme.colors.error} />
                </TouchableOpacity>
              )}
      {/* Navigation Buttons */}
              <HStack space="md" style={{ width: '100%' }}>
                <Animated.View style={{ transform: [{ scale: buttonScale }], flex: 1 }}>
                  <Button
                    action="secondary"
                    size="lg"
                    style={{
                      borderRadius: currentTheme.borderRadius.button,
                      borderColor: currentTheme.colors.border,
                      borderWidth: 1,
                    }}
                    onPress={prev}
                    disabled={step === 0 || loading}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Go back to previous step"
                  >
                    <ButtonText
                      size="md"
                      style={{
                        fontFamily: currentTheme.typography.fontFamily,
                        color: currentTheme.colors.text.primary,
                      }}
                      allowFontScaling
                    >
                      Back
                    </ButtonText>
        </Button>
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: buttonScale }], flex: 1 }}>
                  <Button
                    action="primary"
                    size="lg"
                    style={{
                      borderRadius: currentTheme.borderRadius.button,
                      backgroundColor: currentTheme.colors.primary,
                      ...currentTheme.shadows.medium,
                      elevation: 4,
                    }}
                    onPress={step === steps.length - 1 ? handleRegister : next}
                    disabled={loading}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={step === steps.length - 1 ? 'Finish registration' : 'Go to next step'}
                  >
                    <ButtonText
                      size="md"
                      style={{
                        fontFamily: currentTheme.typography.fontFamily,
                        color: currentTheme.colors.text.primary,
                      }}
                      allowFontScaling
                    >
                      {loading ? 'Processing...' : step === steps.length - 1 ? 'Finish' : 'Next'}
                    </ButtonText>
        </Button>
                </Animated.View>
      </HStack>
            </Box>
          </Animated.View>
      {/* Login Link */}
          <Box style={{ flexDirection: 'row', justifyContent: 'center', paddingBottom: currentTheme.spacing.lg }}>
            <Text
              size="md"
              style={{
                fontFamily: currentTheme.typography.fontFamily,
                color: currentTheme.colors.text.secondary,
              }}
              allowFontScaling
            >
              Already have an account?{' '}
            </Text>
            <Link
              onPress={() => navigation.navigate('Login')}
              accessible
              accessibilityRole="link"
              accessibilityLabel="Navigate to Login"
            >
              <LinkText
                size="md"
                style={{
                  fontFamily: currentTheme.typography.fontFamily,
                  color: currentTheme.colors.primary,
                  fontWeight: '500',
                }}
                allowFontScaling
              >
                Log In
              </LinkText>
            </Link>
      </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 