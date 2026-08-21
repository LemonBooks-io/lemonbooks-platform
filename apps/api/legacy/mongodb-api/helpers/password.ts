// An help function to help generate passwords
export function generateRandomPassword(length = 12) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!";
    return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
  }