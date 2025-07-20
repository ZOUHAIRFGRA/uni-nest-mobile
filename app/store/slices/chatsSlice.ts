// Chats slice for simple store
import type { Chat, Message, ChatsState } from '../../types';

// Initial state
export const initialChatsState: ChatsState = {
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,
  typingUsers: [],
};

// Action types
export const CHATS_ACTION_TYPES = {
  FETCH_CHATS_REQUEST: 'FETCH_CHATS_REQUEST',
  FETCH_CHATS_SUCCESS: 'FETCH_CHATS_SUCCESS',
  FETCH_CHATS_FAILURE: 'FETCH_CHATS_FAILURE',
  FETCH_MESSAGES_REQUEST: 'FETCH_MESSAGES_REQUEST',
  FETCH_MESSAGES_SUCCESS: 'FETCH_MESSAGES_SUCCESS',
  FETCH_MESSAGES_FAILURE: 'FETCH_MESSAGES_FAILURE',
  SEND_MESSAGE_REQUEST: 'SEND_MESSAGE_REQUEST',
  SEND_MESSAGE_SUCCESS: 'SEND_MESSAGE_SUCCESS',
  SEND_MESSAGE_FAILURE: 'SEND_MESSAGE_FAILURE',
  RECEIVE_MESSAGE: 'RECEIVE_MESSAGE',
  SET_CURRENT_CHAT: 'SET_CURRENT_CHAT',
  SET_TYPING_USERS: 'SET_TYPING_USERS',
  MARK_MESSAGES_READ: 'MARK_MESSAGES_READ',
  CREATE_CHAT_SUCCESS: 'CREATE_CHAT_SUCCESS',
  CLEAR_CHATS_ERROR: 'CLEAR_CHATS_ERROR',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
} as const;

// Action creators
export const chatsActions = {
  fetchChatsRequest: () => ({
    type: CHATS_ACTION_TYPES.FETCH_CHATS_REQUEST,
  }),

  fetchChatsSuccess: (chats: Chat[]) => ({
    type: CHATS_ACTION_TYPES.FETCH_CHATS_SUCCESS,
    payload: chats,
  }),

  fetchChatsFailure: (error: string) => ({
    type: CHATS_ACTION_TYPES.FETCH_CHATS_FAILURE,
    payload: error,
  }),

  fetchMessagesRequest: () => ({
    type: CHATS_ACTION_TYPES.FETCH_MESSAGES_REQUEST,
  }),

  fetchMessagesSuccess: (messages: Message[]) => ({
    type: CHATS_ACTION_TYPES.FETCH_MESSAGES_SUCCESS,
    payload: messages,
  }),

  fetchMessagesFailure: (error: string) => ({
    type: CHATS_ACTION_TYPES.FETCH_MESSAGES_FAILURE,
    payload: error,
  }),

  sendMessageRequest: () => ({
    type: CHATS_ACTION_TYPES.SEND_MESSAGE_REQUEST,
  }),

  sendMessageSuccess: (message: Message) => ({
    type: CHATS_ACTION_TYPES.SEND_MESSAGE_SUCCESS,
    payload: message,
  }),

  sendMessageFailure: (error: string) => ({
    type: CHATS_ACTION_TYPES.SEND_MESSAGE_FAILURE,
    payload: error,
  }),

  receiveMessage: (message: Message) => ({
    type: CHATS_ACTION_TYPES.RECEIVE_MESSAGE,
    payload: message,
  }),

  setCurrentChat: (chat: Chat | null) => ({
    type: CHATS_ACTION_TYPES.SET_CURRENT_CHAT,
    payload: chat,
  }),

  setTypingUsers: (userIds: string[]) => ({
    type: CHATS_ACTION_TYPES.SET_TYPING_USERS,
    payload: userIds,
  }),

  markMessagesRead: (messageIds: string[]) => ({
    type: CHATS_ACTION_TYPES.MARK_MESSAGES_READ,
    payload: messageIds,
  }),

  createChatSuccess: (chat: Chat) => ({
    type: CHATS_ACTION_TYPES.CREATE_CHAT_SUCCESS,
    payload: chat,
  }),

  clearChatsError: () => ({
    type: CHATS_ACTION_TYPES.CLEAR_CHATS_ERROR,
  }),

  clearMessages: () => ({
    type: CHATS_ACTION_TYPES.CLEAR_MESSAGES,
  }),
};

// Reducer
export const chatsReducer = (state: ChatsState = initialChatsState, action: any): ChatsState => {
  switch (action.type) {
    case CHATS_ACTION_TYPES.FETCH_CHATS_REQUEST:
    case CHATS_ACTION_TYPES.FETCH_MESSAGES_REQUEST:
    case CHATS_ACTION_TYPES.SEND_MESSAGE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CHATS_ACTION_TYPES.FETCH_CHATS_SUCCESS:
      return {
        ...state,
        loading: false,
        chats: action.payload,
        error: null,
      };

    case CHATS_ACTION_TYPES.FETCH_MESSAGES_SUCCESS:
      return {
        ...state,
        loading: false,
        messages: action.payload,
        error: null,
      };

    case CHATS_ACTION_TYPES.SEND_MESSAGE_SUCCESS:
    case CHATS_ACTION_TYPES.RECEIVE_MESSAGE:
      return {
        ...state,
        loading: false,
        messages: [...state.messages, action.payload],
        error: null,
        // Update the last message in the current chat
        chats: state.chats.map((chat: Chat) =>
          chat._id === action.payload.chatId
            ? { ...chat, lastMessage: action.payload, lastMessageAt: action.payload.createdAt }
            : chat
        ),
      };

    case CHATS_ACTION_TYPES.CREATE_CHAT_SUCCESS:
      return {
        ...state,
        chats: [...state.chats, action.payload],
        currentChat: action.payload,
        error: null,
      };

    case CHATS_ACTION_TYPES.FETCH_CHATS_FAILURE:
    case CHATS_ACTION_TYPES.FETCH_MESSAGES_FAILURE:
    case CHATS_ACTION_TYPES.SEND_MESSAGE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CHATS_ACTION_TYPES.SET_CURRENT_CHAT:
      return {
        ...state,
        currentChat: action.payload,
        messages: [], // Clear messages when switching chats
      };

    case CHATS_ACTION_TYPES.SET_TYPING_USERS:
      return {
        ...state,
        typingUsers: action.payload,
      };

    case CHATS_ACTION_TYPES.MARK_MESSAGES_READ:
      return {
        ...state,
        messages: state.messages.map((message: Message) =>
          action.payload.includes(message._id)
            ? { ...message, readBy: [...message.readBy, 'currentUserId'] } // You'll need to get current user ID
            : message
        ),
      };

    case CHATS_ACTION_TYPES.CLEAR_CHATS_ERROR:
      return {
        ...state,
        error: null,
      };

    case CHATS_ACTION_TYPES.CLEAR_MESSAGES:
      return {
        ...state,
        messages: [],
      };

    default:
      return state;
  }
};

// Selectors
export const selectChats = (state: { chats: ChatsState }) => state.chats;
export const selectChatsList = (state: { chats: ChatsState }) => state.chats.chats;
export const selectCurrentChat = (state: { chats: ChatsState }) => state.chats.currentChat;
export const selectMessages = (state: { chats: ChatsState }) => state.chats.messages;
export const selectChatsLoading = (state: { chats: ChatsState }) => state.chats.loading;
export const selectChatsError = (state: { chats: ChatsState }) => state.chats.error;
export const selectTypingUsers = (state: { chats: ChatsState }) => state.chats.typingUsers;

export default chatsReducer;
