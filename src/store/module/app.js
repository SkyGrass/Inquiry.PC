import {
  getBreadCrumbList,
  setTagNavListInLocalstorage,
  getMenuByRouter,
  getTagNavListFromLocalstorage,
  getHomeRoute,
  getNextRoute,
  routeHasExist,
  routeEqual,
  getRouteTitleHandled,
  localSave,
  localRead,
  getMenuListByRoutes,
  getTagNavByRouteName
} from "@/libs/util";
import beforeClose from "@/router/before-close";
import { saveErrorLogger } from "@/api/data";
import router from "@/router";
import { resetRouter } from "@/router";
import config from "@/config";
const { homeName } = config;

const closePage = (state, route) => {
  const nextRoute = getNextRoute(state.tagNavList, route);
  state.tagNavList = state.tagNavList.filter(item => {
    return !routeEqual(item, route);
  });
  setTagNavListInLocalstorage(state.tagNavList);
  router.push(nextRoute);
};

export default {
  state: {
    breadCrumbList: [],
    tagNavList: [],
    homeRoute: {},
    local: localRead("local"),
    errorList: [],
    hasReadErrorPage: false,
    // 定义菜单变量
    menuList: []
  },
  getters: {
    // menuList: (state, getters, rootState) => {
    //    return getMenuByRouter(routers, rootState.user.access, rootState.user.pages);
    //  },
    errorCount: state => state.errorList.length,
    menuList: state => state.menuList
    // 通过路由列表得到菜单列表
    //menuList: (state, getters, rootState) => getMenuListByRoutes(routes)
  },
  mutations: {
    setBreadCrumb(state, route) {
      state.breadCrumbList = getBreadCrumbList(route, state.homeRoute);
    },
    setHomeRoute(state, routes) {
      state.homeRoute = getHomeRoute(routes, homeName);
    },
    setTagNavList(state, list) {
      let tagList = [];
      if (list) {
        tagList = [...list];
      } else tagList = getTagNavListFromLocalstorage() || [];
      if (tagList[0] && tagList[0].name !== homeName) tagList.shift();
      let homeTagIndex = tagList.findIndex(item => item.name === homeName);
      if (homeTagIndex > 0) {
        let homeTag = tagList.splice(homeTagIndex, 1)[0];
        tagList.unshift(homeTag);
      }
      state.tagNavList = tagList;
      setTagNavListInLocalstorage([...tagList]);
    },
    closeTag(state, route) {
      let tag = state.tagNavList.filter(item => routeEqual(item, route));
      route = tag[0] ? tag[0] : null;
      if (!route) return;
      if (
        route.meta &&
        route.meta.beforeCloseName &&
        route.meta.beforeCloseName in beforeClose
      ) {
        new Promise(beforeClose[route.meta.beforeCloseName]).then(close => {
          if (close) {
            closePage(state, route);
          }
        });
      } else {
        closePage(state, route);
      }
    },
    addTag(state, { route, type = "unshift" }) {
      let router = getRouteTitleHandled(route);
      if (!routeHasExist(state.tagNavList, router)) {
        if (type === "push") state.tagNavList.push(router);
        else {
          if (router.name === homeName) state.tagNavList.unshift(router);
          else state.tagNavList.splice(1, 0, router);
        }
        setTagNavListInLocalstorage([...state.tagNavList]);
      }
    },
    setLocal(state, lang) {
      localSave("local", lang);
      state.local = lang;
    },
    addError(state, error) {
      state.errorList.push(error);
    },
    setHasReadErrorLoggerStatus(state, status = true) {
      state.hasReadErrorPage = status;
    },
    setMenuList(state, routes) {
      state.menuList = getMenuListByRoutes(routes);
    },
    // 接受前台数组，刷新菜单
    refreshMenuList(state, routes) {
      resetRouter();
      router.addRoutes(
        routes.concat([
          {
            path: "*",
            redirect: "/404"
          }
        ]),
        { replace: true }
      );
      state.menuList = routes;
    }
  },
  actions: {
    addErrorLog({ commit, rootState }, info) {
      if (!window.location.href.includes("error_logger_page"))
        commit("setHasReadErrorLoggerStatus", false);
      const { user: { token, userGuid, userName } } = rootState;
      let data = {
        ...info,
        time: Date.parse(new Date()),
        token,
        userGuid,
        userName
      };
      saveErrorLogger(info).then(() => {
        commit("addError", data);
      });
    },
    refreshMenuList({ state, commit }, list) {
      return new Promise((resolve, reject) => {
        try {
          commit("setMenuList", list);
          commit("refreshMenuList", list);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
    closeTag({ state, commit }, routeName) {
      commit("closeTag", { name: routeName });
    }
  }
};
