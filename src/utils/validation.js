// make sure user to enter correct email format.
function isValidEmailFormat(email) {
  if (typeof email !== "string" || email.length === 0) {
    return false;
  }
  const atIndex = email.indexOf("@");
  if (atIndex === -1 || atIndex === 0 || atIndex === email.length - 1) {
    return false; // No '@' or '@' at start/end
  }

  const domainPart = email.substring(atIndex + 1);
  const dotIndex = domainPart.indexOf(".");
  if (dotIndex === -1 || dotIndex === 0 || dotIndex === domainPart.length - 1) {
    return false; // No '.' in domain part or '.' at start/end of domain
  }

  return true;
}

// make sure user enter valid password with one uppercase letter, at least one number and at least 8 characters.
function isValidPasswordStrength(password) {
  if (typeof password !== "string") {
    return false;
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUppercase && hasNumber;
}

module.exports = {
  isValidEmailFormat,
  isValidPasswordStrength,
};
