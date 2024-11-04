export const addAccountTokeychain = (username, keys) => new Promise((resolve, reject) => {
    if (window.hive_keychain) {
        window.hive_keychain.requestAddAccount(username, keys, (resp) => {
            if (!resp.success) {
                reject({ message: "Operation cancelled" });
            }
            resolve(resp);
        });
    } else {
        reject({ message: "Hive Keychain not available" });
    }
  });