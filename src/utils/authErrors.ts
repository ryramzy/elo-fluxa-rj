/**
 * Translates Firebase Auth error codes into friendly Portuguese messages.
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) return 'Ocorreu um erro inesperado. Tente novamente.';
  
  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/unauthorized-domain':
      return 'Este domínio (eloingles.com.br) ainda não está autorizado no Firebase Console. Adicione eloingles.com.br e www.eloingles.com.br em Firebase > Authentication > Settings > Authorized Domains.';
    case 'auth/popup-closed-by-user':
      return 'A janela do Google foi fechada antes de concluir o login. Tente novamente.';
    case 'auth/popup-blocked':
      return 'A janela de login foi bloqueada pelo navegador. Permita popups ou use seu email e senha.';
    case 'auth/email-already-in-use':
      return 'Este email já está cadastrado. Tente fazer login ou recuperar sua senha.';
    case 'auth/invalid-email':
      return 'Formato de email inválido. Verifique e tente novamente.';
    case 'auth/weak-password':
      return 'A senha deve conter no mínimo 6 caracteres.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
      return 'Email ou senha incorretos. Verifique seus dados ou crie uma conta.';
    case 'auth/network-request-failed':
      return 'Falha na conexão com a internet. Verifique sua rede e tente novamente.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas sem sucesso. Aguarde alguns instantes e tente novamente.';
    default:
      if (message.includes('unauthorized domain')) {
        return 'Domínio não autorizado no Firebase Console. Adicione eloingles.com.br em Firebase Authentication > Authorized Domains.';
      }
      return message || 'Não foi possível completar a autenticação. Tente novamente.';
  }
}
