export interface PasswordValidation {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
  requirements: {
    minLength: boolean;
    maxLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export const validatePassword = (password: string): PasswordValidation => {
  const requirements = {
    minLength: password.length >= 8,
    maxLength: password.length <= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const errors: string[] = [];
  if (!requirements.minLength) errors.push('Password must be at least 8 characters');
  if (!requirements.maxLength) errors.push('Password must be at most 12 characters');
  if (!requirements.hasUppercase) errors.push('Password must include an uppercase letter');
  if (!requirements.hasLowercase) errors.push('Password must include a lowercase letter');
  if (!requirements.hasNumber) errors.push('Password must include a number');
  if (!requirements.hasSpecialChar) errors.push('Password must include a special character');

  const isValid = Object.values(requirements).every(req => req === true);

  // Calculate strength based on met requirements
  const metRequirements = Object.values(requirements).filter(req => req === true).length;
  let strength: 'weak' | 'medium' | 'strong';

  if (metRequirements <= 2) {
    strength = 'weak';
  } else if (metRequirements <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    isValid,
    strength,
    errors,
    requirements,
  };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && password.length > 0;
};
