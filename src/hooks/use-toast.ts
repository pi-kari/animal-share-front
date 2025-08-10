type ToastOpts = { title?: string; description?: string; variant?: 'default'|'destructive' }
export function useToast() {
  return {
    toast: ({ title, description, variant }: ToastOpts) => {
      // とりあえずコンソールに出すだけ（必要なら window.alert にしても可）
      console.log('[toast]', variant ?? 'default', title ?? '', description ?? '')
    }
  }
}
