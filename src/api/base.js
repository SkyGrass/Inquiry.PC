import axios from "@/libs/api.request";

export const queryDeptList = () => {
  return axios.request({
    url: "bus/dept/list",
    method: "get",
  });
};

export const queryBaseList = (data) => {
  return axios.request({
    url: "pcbus/base/list",
    method: "post",
    data,
  });
};
