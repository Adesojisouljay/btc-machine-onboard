export const validateUsername = (username, setError) => {
    if (username.length > 16) {
      setError("Username must not exceed 16 characters.");
      return false;
    }
  
    const usernameParts = username.split(".");
    for (const item of usernameParts) {
      if (item.length < 3) {
        setError("Each part of the username must be at least 3 characters long.");
        return false;
      }
      if (!/^[\x00-\x7F]*$/.test(item[0])) {
        setError("Each part of the username must start with an ASCII character.");
        return false;
      }
      if (!/^([a-zA-Z0-9]|-|\.)+$/.test(item)) {
        setError("Username can only contain letters, numbers, dashes, and dots.");
        return false;
      }
      if (item.includes("--")) {
        setError("Username parts cannot contain consecutive hyphens (--).");
        return false;
      }
      if (/^\d/.test(item)) {
        setError("Username parts cannot start with a number.");
        return false;
      }
    }
    setError("")
    // If no errors are found
    return true;
  }
  