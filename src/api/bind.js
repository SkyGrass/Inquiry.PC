import axios from "@/libs/api.request";

export const queryUPM = (data) => {
  return axios.request({
    url: "pcbus/bind/upm",
    method: "post",
    data,
  });
};

export const bindUPM = (data) => {
  return axios.request({
    url: "bus/bind/partner",
    method: "post",
    data,
  });
};

export const unBindUPM = (data) => {
  return axios.request({
    url: "pcbus/unbind/upm",
    method: "post",
    data,
  });
};

export const queryUPEM = (data) => {
  return axios.request({
    url: "pcbus/bind/upem",
    method: "post",
    data,
  });
};

export const bindUPEM = (data) => {
  return axios.request({
    url: "bus/bind/person",
    method: "post",
    data,
  });
};

export const bindUPEDM = (data) => {
  return axios.request({
    url: "bus/bind/persondept",
    method: "post",
    data,
  });
};

export const unBindUPEM = (data) => {
  return axios.request({
    url: "pcbus/unbind/upem",
    method: "post",
    data,
  });
};

export const queryUWM = (data) => {
  return axios.request({
    url: "pcbus/bind/uwm",
    method: "post",
    data,
  });
};

export const bindUWM = (data) => {
  return axios.request({
    url: "bus/bind/wc",
    method: "post",
    data,
  });
};

export const unBindUWM = (data) => {
  return axios.request({
    url: "pcbus/unbind/uwm",
    method: "post",
    data,
  });
};

export const querySgFlowInfo = (params) => {
  return axios.request({
    url: "pcbus/flow/sginfo",
    method: "get",
    params,
  });
};

export const saveAuditFlow = (data) => {
  return axios.request({
    url: "pcbus/flow/sg",
    method: "post",
    data,
  });
};
