import axios from "@/libs/api.request";

export const queryClsList = () => {
  return axios.request({
    url: "bus/pc/list",
    method: "get"
  });
};
