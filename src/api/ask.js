import axios from "@/libs/api.request";

export const queryInvPrice = params => {
  return axios.request({
    url: "pcbus/ask/check",
    method: "get",
    params
  });
};

export const checkPeriodIsValid = params => {
  return axios.request({
    url: "pcbus/ask/periodisvalid",
    method: "get",
    params
  });
};

export const saveForm = data => {
  return axios.request({
    url: "bus/ask/save",
    method: "post",
    data
  });
};

export const updateForm = data => {
  return axios.request({
    url: "bus/ask/modify",
    method: "post",
    data
  });
};

export const confirmForm = data => {
  return axios.request({
    url: "pcbus/ask/confirm",
    method: "post",
    data
  });
};

export const loadAsk = params => {
  return axios.request({
    url: "bus/ask/one",
    method: "get",
    params
  });
};

export const loadAskRecord = params => {
  return axios.request({
    url: "bus/ask/record",
    method: "get",
    params
  });
};

export const queryAskList = data => {
  return axios.request({
    url: "pcbus/ask/list",
    method: "post",
    data
  });
};

export const delAsk = data => {
  return axios.request({
    url: "pcbus/ask/delMulit",
    method: "post",
    data
  });
};

export const auditAsk = data => {
  return axios.request({
    url: "bus/ask/audit",
    method: "post",
    data
  });
};

export const unAuditAsk = data => {
  return axios.request({
    url: "bus/ask/unaudit",
    method: "post",
    data
  });
};

export const notify = data => {
  return axios.request({
    url: "bus/ask/sendpartner",
    method: "post",
    data
  });
};

export const notifyConfirm = data => {
  return axios.request({
    url: "bus/ask/partnerconfirmprice",
    method: "post",
    data
  });
};