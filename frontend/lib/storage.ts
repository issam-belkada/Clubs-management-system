import Cookies from "universal-cookie";

const cookies = new Cookies();
const TOKEN_KEY = "authToken";

export const storage = {
  getToken: (): string | null => {
    return cookies.get(TOKEN_KEY) || null;
  },
  setToken: (token: string) => {
    cookies.set(TOKEN_KEY, token, { path: "/" });
  },
  removeToken: () => {
    cookies.remove(TOKEN_KEY, { path: "/" });
  },
};