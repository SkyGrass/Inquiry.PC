import axios from "@/libs/api.request";

export const queryInvList = params => {
  return axios.request({
    url: "bus/inv/list",
    method: "get",
    params
  });
};
