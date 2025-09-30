import { Alert } from 'react-native';

interface ConfirmationDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export const showConfirmationDialog = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: confirmText,
        style: destructive ? 'destructive' : 'default',
        onPress: async () => {
          try {
            await onConfirm();
          } catch (error) {
            console.error('Confirmation action failed:', error);
          }
        },
      },
    ]
  );
};

// Predefined confirmation dialogs for common actions
export const confirmations = {
  deleteChat: (onConfirm: () => void | Promise<void>) =>
    showConfirmationDialog({
      title: 'Delete Chat',
      message: 'Are you sure you want to delete this chat? This action cannot be undone.',
      confirmText: 'Delete',
      destructive: true,
      onConfirm,
    }),

  deleteDocument: (onConfirm: () => void | Promise<void>) =>
    showConfirmationDialog({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document? This action cannot be undone.',
      confirmText: 'Delete',
      destructive: true,
      onConfirm,
    }),

  deleteQuiz: (onConfirm: () => void | Promise<void>) =>
    showConfirmationDialog({
      title: 'Delete Quiz',
      message: 'Are you sure you want to delete this quiz? This action cannot be undone.',
      confirmText: 'Delete',
      destructive: true,
      onConfirm,
    }),

  deleteTopic: (onConfirm: () => void | Promise<void>) =>
    showConfirmationDialog({
      title: 'Delete Topic',
      message: 'Are you sure you want to delete this topic? This action cannot be undone.',
      confirmText: 'Delete',
      destructive: true,
      onConfirm,
    }),

  deleteWebsite: (onConfirm: () => void | Promise<void>) =>
    showConfirmationDialog({
      title: 'Delete Website',
      message: 'Are you sure you want to delete this website? This action cannot be undone.',
      confirmText: 'Delete',
      destructive: true,
      onConfirm,
    }),

  signOut: (onConfirm: () => void | Promise<void>) =>
    showConfirmationDialog({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      confirmText: 'Sign Out',
      destructive: true,
      onConfirm,
    }),

  clearData: (onConfirm: () => void | Promise<void>) =>
    showConfirmationDialog({
      title: 'Clear Data',
      message: 'This will permanently delete all your data. This action cannot be undone.',
      confirmText: 'Clear All Data',
      destructive: true,
      onConfirm,
    }),

  resetQuiz: (onConfirm: () => void | Promise<void>) =>
    showConfirmationDialog({
      title: 'Reset Quiz',
      message: 'Are you sure you want to reset this quiz? Your current progress will be lost.',
      confirmText: 'Reset',
      destructive: true,
      onConfirm,
    }),
};
