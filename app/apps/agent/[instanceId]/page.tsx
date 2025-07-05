'use client';

import {
  ChatInputBackdrop,
  ChatLoader,
  ScrollToBottomButton,
  WelcomeScreen,
} from '@components/chat';
import { ChatInput } from '@components/chat-input';
import { DynamicSuggestedQuestions } from '@components/chat/dynamic-suggested-questions';
import {
  useChatInterface,
  useChatScroll,
  useChatWidth,
  useMobile,
  useWelcomeScreen,
} from '@lib/hooks';
import { useCurrentApp } from '@lib/hooks/use-current-app';
import { useProfile } from '@lib/hooks/use-profile';
import { useThemeColors } from '@lib/hooks/use-theme-colors';
import { useAppListStore } from '@lib/stores/app-list-store';
import { useChatInputStore } from '@lib/stores/chat-input-store';
import { useChatLayoutStore } from '@lib/stores/chat-layout-store';
import { useChatStore } from '@lib/stores/chat-store';
import { useSidebarStore } from '@lib/stores/sidebar-store';
import { cn } from '@lib/utils';
import { Blocks, Loader2 } from 'lucide-react';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useParams, usePathname, useRouter } from 'next/navigation';

export default function AppDetailPage() {
  const { colors, isDark } = useThemeColors();
  const isMobile = useMobile();
  const { widthClass, paddingClass } = useChatWidth();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const instanceId = params.instanceId as string;
  const t = useTranslations('pages.apps');

  // Get user profile, used for welcome interface display
  const { profile } = useProfile();

  // Use chat interface logic, get messages status and related methods
  const {
    messages,
    handleSubmit: originalHandleSubmit,
    isProcessing,
    isWaitingForResponse,
    handleStopProcessing,
    sendDirectMessage,
  } = useChatInterface();

  // Use unified welcome interface logic, now support app detail page
  const { isWelcomeScreen, setIsWelcomeScreen } = useWelcomeScreen();

  // Get chat layout state, used for input box height management
  const { inputHeight } = useChatLayoutStore();
  const chatInputHeightVar = `${inputHeight || 80}px`;

  // Local state management
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add scroll management, ensure message list can scroll correctly
  const scrollRef = useChatScroll(messages);

  // Sidebar selected state management
  const { selectItem } = useSidebarStore();

  // Chat state management
  const { clearMessages, setCurrentConversationId } = useChatStore();

  // Application initialization state
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  // 🎯 New: Ensure loader displays for at least 0.7 seconds, allowing layout to stabilize
  const [hasMinimumLoadTime, setHasMinimumLoadTime] = useState(false);

  // 🎯 Minimum loading time control: Ensure loader displays for at least 0.7 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMinimumLoadTime(true);
    }, 700); // 0.7 seconds

    return () => clearTimeout(timer);
  }, []);

  // Application-related state
  const { apps, fetchApps } = useAppListStore();
  const {
    currentAppId,
    isValidating,
    isValidatingForMessage,
    switchToSpecificApp,
    error: appError,
  } = useCurrentApp();

  // Get current application instance data
  const currentApp = apps.find(app => app.instance_id === instanceId);

  // Theme synchronization: ensure input box style follows theme changes
  const setDarkMode = useChatInputStore(state => state.setDarkMode);
  useEffect(() => {
    setDarkMode(isDark);
  }, [isDark, setDarkMode]);

  // 🎯 Critical fix: useLayoutEffect ensures immediate cleanup of state when switching routes
  // This executes earlier than useEffect, allowing state to be cleared before rendering, avoiding display of incorrect content
  const { clearConversationState } = useChatInterface();

  useLayoutEffect(() => {
    // 🎯 Fix: correctly determine if the current page is an agent page
    if (pathname === `/apps/agent/${instanceId}`) {
      console.log(
        '[AppDetail] Route switched to agent page, immediately clean up chat state'
      );

      // Immediately clear all messages
      useChatStore.getState().clearMessages();
      clearMessages();

      // Set current conversation ID to null
      setCurrentConversationId(null);

      // 🎯 New: clean up conversation state in use-chat-interface
      // This ensures that difyConversationId, dbConversationUUID, and conversationAppId are correctly cleared
      clearConversationState();

      // Force welcome screen state to true
      setIsWelcomeScreen(true);

      // Reset submission state
      setIsSubmitting(false);

      console.log('[AppDetail] Chat state cleanup completed');
    }
  }, [
    pathname,
    instanceId,
    clearMessages,
    setCurrentConversationId,
    setIsWelcomeScreen,
    clearConversationState,
  ]);

  // Page initialization: switch to target app and synchronize sidebar selected state
  // 🎯 Optimization: simplify initialization logic, avoid validation bounce, improve user experience
  useEffect(() => {
    const initializeApp = async () => {
      if (!instanceId) return;

      try {
        setInitError(null);

        console.log(
          '[AppDetail] Starting to initialize application:',
          instanceId
        );

        // 🎯 Optimization: simplify loading state check
        // Only display loading state when truly needed
        const needsAppListFetch = apps.length === 0;
        const currentAppMatches = currentAppId === instanceId;

        // If the application list is empty, need to fetch
        if (needsAppListFetch) {
          setIsInitializing(true);
          console.log(
            '[AppDetail] Application list is empty, starting to fetch'
          );
          await fetchApps();
        }

        // Re-fetch the latest application list
        const latestApps = useAppListStore.getState().apps;
        console.log(
          '[AppDetail] Current application list length:',
          latestApps.length
        );

        // Check if the application exists
        const targetApp = latestApps.find(
          app => app.instance_id === instanceId
        );
        if (!targetApp) {
          console.error('[AppDetail] Application does not exist:', instanceId);
          setInitError(t('errors.appNotFound'));
          return;
        }

        console.log(
          '[AppDetail] Found target application:',
          targetApp.display_name
        );

        // Immediately set sidebar selected state
        selectItem('app', instanceId);

        // 🎯 Critical optimization: simplify application switching logic
        // Only switch when the current application does not match
        // Avoid unnecessary validation calls
        if (!currentAppMatches) {
          console.log(
            '[AppDetail] Need to switch application, from',
            currentAppId,
            'to',
            instanceId
          );

          // 🎯 Use simpler switching logic, avoid complex validation
          try {
            await switchToSpecificApp(instanceId);
            console.log('[AppDetail] Application switched successfully');
          } catch (switchError) {
            console.warn(
              '[AppDetail] Application switching failed, but continue to load page:',
              switchError
            );
            // 🎯 Even if switching fails, do not block page loading
            // The page can still be displayed normally, and the user can still use it
          }
        } else {
          console.log(
            '[AppDetail] Current application already matches, no need to switch'
          );
        }

        console.log('[AppDetail] Application initialization completed');
      } catch (error) {
        console.error('[AppDetail] Initialization failed:', error);
        setInitError(
          error instanceof Error
            ? error.message
            : t('errors.initializationFailed')
        );
      } finally {
        // 🎯 Ensure that the initialization state is cleared in all cases
        setIsInitializing(false);
      }
    };

    if (instanceId) {
      initializeApp();
    }
  }, [
    instanceId,
    apps.length,
    currentAppId,
    fetchApps,
    switchToSpecificApp,
    selectItem,
  ]);

  // When the page is unloaded, clear the selected state (when leaving the application detail page)
  useEffect(() => {
    return () => {
      // Check if the application detail page has been left
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/apps/')) {
        selectItem(null, null);
      }
    };
  }, [selectItem]);

  // Wrap handleSubmit, implement UI switching logic
  const handleSubmit = useCallback(
    async (message: string, files?: any[]) => {
      try {
        // 🎯 Simplify UI switching logic: immediately respond to user operations
        // Immediately set submission state to true
        setIsSubmitting(true);

        // Immediately close the welcome interface
        setIsWelcomeScreen(false);

        console.log('[AppDetail] UI state updated, starting to send message');

        // Call the original handleSubmit, it will create a conversation and send a message
        await originalHandleSubmit(message, files);

        console.log(
          '[AppDetail] Message sent successfully, waiting for route jump'
        );
      } catch (error) {
        console.error('[AppDetail] Message sending failed:', error);

        // When sending fails, restore the UI state
        setIsSubmitting(false);
        setIsWelcomeScreen(true);
      }
    },
    [originalHandleSubmit, setIsWelcomeScreen]
  );

  // Error state
  if (initError) {
    return (
      <div
        className={cn(
          'relative flex h-full w-full flex-col',
          colors.mainBackground.tailwind,
          'items-center justify-center'
        )}
      >
        <div className="text-center">
          <Blocks
            className={cn(
              'mx-auto mb-4 h-16 w-16',
              isDark ? 'text-stone-400' : 'text-stone-500'
            )}
          />
          <h2
            className={cn(
              'mb-2 font-serif text-xl font-semibold',
              isDark ? 'text-stone-300' : 'text-stone-700'
            )}
          >
            {t('errors.appLoadFailed')}
          </h2>
          <p
            className={cn(
              'mb-4 font-serif',
              isDark ? 'text-stone-400' : 'text-stone-500'
            )}
          >
            {initError}
          </p>
          <button
            onClick={() => router.push('/apps')}
            className={cn(
              'rounded-lg px-4 py-2 font-serif transition-colors',
              isDark
                ? 'bg-stone-700 text-stone-200 hover:bg-stone-600'
                : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
            )}
          >
            {t('buttons.backToMarket')}
          </button>
        </div>
      </div>
    );
  }

  // Loading state - 🎯 Ensure at least 0.7 seconds are displayed
  if (
    !hasMinimumLoadTime ||
    isInitializing ||
    (isValidating && !isValidatingForMessage) ||
    !currentApp
  ) {
    return (
      <div
        className={cn(
          'relative flex h-full w-full flex-col',
          colors.mainBackground.tailwind,
          'items-center justify-center'
        )}
      >
        <div className="text-center">
          <Loader2
            className={cn(
              'mx-auto mb-4 h-8 w-8 animate-spin',
              isDark ? 'text-stone-400' : 'text-stone-500'
            )}
          />
          <p
            className={cn(
              'font-serif',
              isDark ? 'text-stone-400' : 'text-stone-500'
            )}
          >
            {isInitializing
              ? t('status.loadingApp')
              : isValidating && !isValidatingForMessage
                ? t('status.validatingConfig')
                : t('status.loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col',
        colors.mainBackground.tailwind,
        colors.mainText.tailwind
      )}
    >
      <div
        className={cn(
          'relative flex min-h-0 flex-1 flex-col overflow-hidden',
          'pt-10'
        )}
        style={
          { '--chat-input-height': chatInputHeightVar } as React.CSSProperties
        }
      >
        <div className="min-h-0 flex-1">
          {isWelcomeScreen && messages.length === 0 ? (
            <div
              className={cn(
                'h-full overflow-y-auto scroll-smooth',
                'mx-auto w-full',
                widthClass,
                paddingClass
              )}
            >
              <div className="py-8">
                <div className="mb-8">
                  <WelcomeScreen username={profile?.username} />
                </div>
              </div>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="chat-scroll-container h-full overflow-y-auto scroll-smooth"
            >
              <ChatLoader
                messages={messages}
                isWaitingForResponse={isWaitingForResponse}
                isLoadingInitial={false}
              />
            </div>
          )}
        </div>

        <ScrollToBottomButton />

        <ChatInputBackdrop />

        <ChatInput
          onSubmit={handleSubmit}
          placeholder={t('startChatWith', {
            appName: currentApp.display_name || t('defaultApp'),
          })}
          isProcessing={isProcessing}
          isWaiting={isWaitingForResponse}
          onStop={handleStopProcessing}
          showModelSelector={false}
          requireModelValidation={false}
        />

        {isWelcomeScreen && messages.length === 0 && (
          <DynamicSuggestedQuestions onQuestionClick={sendDirectMessage} />
        )}
      </div>
    </div>
  );
}
