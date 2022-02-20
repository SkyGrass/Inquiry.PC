import axios from "@/libs/api.request";

export const querySubSummeryRpt = (data) => {
  return axios.request({
    url: "pcbus/rpt/subsummery",
    method: "post",
    data,
  });
};
