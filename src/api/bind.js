import axios from "@/libs/api.request";

export const querySgFlowInfo = params => {
  return axios.request({
    url: "pcbus/flow/sginfo",
    method: "get",
    params
  });
};

export const saveAuditFlow = data => {
  return axios.request({
    url: "pcbus/flow/sg",
    method: "post",
    data
  });
};
