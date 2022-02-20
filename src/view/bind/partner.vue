 
<template>
  <div>
    <Card>
      <tables
        ref="tables"
        editable
        searchable
        :border="false"
        size="small"
        search-place="top"
        v-model="stores.bind.data"
        :totalCount="stores.bind.query.totalCount"
        :columns="stores.bind.columns"
        @on-select="handleSelect"
        @on-selection-change="handleSelectionChange"
        @on-refresh="handleRefresh"
        :row-class-name="rowClsRender"
        @on-page-change="handlePageChanged"
        @on-page-size-change="handlePageSizeChanged"
        @on-delete="handleDelete"
        @on-choose="handleChoose"
      >
        <div slot="search">
          <section class="dnc-toolbar-wrap">
            <Row :gutter="16">
              <Col span="16">
                <Form inline @submit.native.prevent>
                  <FormItem>
                    <Input
                      type="text"
                      search
                      :clearable="true"
                      v-model="stores.bind.query.kw"
                      placeholder="输入关键字搜索..."
                      @on-search="handlerSearch()"
                    />
                  </FormItem>
                  <FormItem>
                    <ButtonGroup>
                      <Button
                        icon="md-search"
                        title="查询"
                        @click="handleRefresh"
                        >查询</Button
                      >
                    </ButtonGroup>
                  </FormItem>
                </Form>
              </Col>
              <Col span="8" class="dnc-toolbar-btns">
                <ButtonGroup class="mr3">
                  <Button
                    icon="md-refresh"
                    title="刷新"
                    @click="handleRefresh"
                  ></Button>
                </ButtonGroup>
              </Col>
            </Row>
          </section>
        </div>
      </tables>
    </Card>
    <Modal
      v-model="visiableForDialog"
      title="请选择供应商"
      :mask-closable="false"
      :styles="stores.base.styles"
    >
      <Card>
        <tables
          ref="tables"
          editable
          searchable
          :border="false"
          size="small"
          search-place="top"
          v-model="stores.base.data"
          :totalCount="stores.base.query.totalCount"
          :columns="stores.base.columns"
          :row-class-name="rowClsRender"
          @on-refresh="handleRefresh1"
          @on-page-change="handlePageChanged1"
          @on-page-size-change="handlePageSizeChanged1"
          @on-confirm="handleConfirm"
        >
          <div slot="search">
            <section class="dnc-toolbar-wrap">
              <Row :gutter="16">
                <Col span="16">
                  <Form inline @submit.native.prevent>
                    <FormItem>
                      <Input
                        type="text"
                        search
                        :clearable="true"
                        v-model="stores.base.query.kw"
                        placeholder="输入关键字搜索..."
                        @on-search="handlerSearchPartner()"
                      />
                    </FormItem>
                    <FormItem>
                      <ButtonGroup>
                        <Button
                          icon="md-search"
                          title="查询"
                          @click="handleRefresh1"
                          >查询</Button
                        >
                      </ButtonGroup>
                    </FormItem>
                  </Form>
                </Col>
                <Col span="8" class="dnc-toolbar-btns">
                  <ButtonGroup class="mr3">
                    <Button
                      icon="md-refresh"
                      title="刷新"
                      @click="handleRefresh1"
                    ></Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </section>
          </div>
        </tables>
      </Card>
      <div slot="footer">
        <Button size="large" @click="visiableForDialog = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Tables from "_c/tables";
import { queryUPM, bindUPM, unBindUPM } from "@/api/bind";
import { queryBaseList } from "@/api/base";
import dayjs from "dayjs";
import { mapGetters } from "vuex";
export default {
  name: "bind_partner_list_page",
  components: {
    Tables,
  },
  data() {
    return {
      formModel: {
        selection: [],
      },
      stores: {
        bind: {
          query: {
            totalCount: 0,
            pageSize: 20,
            currentPage: 1,
            kw: "",
            type: 3,
            notbind: 0,
            sort: [
              {
                direct: "ASC",
                field: "name",
              },
            ],
          },
          columns: [
            {
              title: "用户名",
              width: 120,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "displayName",
            },
            {
              title: "供应商名称",
              width: 220,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "partnerName",
            },
            {
              title: "绑定时间",
              width: 220,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "createdOn",
            },
            {
              title: "操作",
              align: "center",
              key: "handle",
              width: 150,
              className: "table-command-column",
              options: ["edit"],
              button: [
                (h, params, vm) => {
                  const { haveBinding } = params.row;
                  return h(
                    "Poptip",
                    {
                      props: {
                        transfer: true,
                        confirm: true,
                        title: "你确定要解绑吗?",
                      },
                      style: {
                        display: haveBinding > 0 ? "" : "none",
                      },
                      on: {
                        "on-ok": () => {
                          vm.$emit("on-delete", params);
                        },
                      },
                    },
                    [
                      h(
                        "Tooltip",
                        {
                          props: {
                            placement: "left",
                            transfer: true,
                            delay: 1000,
                          },
                        },
                        [
                          h("Button", {
                            props: {
                              shape: "circle",
                              size: "small",
                              icon: "md-trash",
                              type: "error",
                            },
                          }),
                          h(
                            "p",
                            {
                              slot: "content",
                              style: {
                                whiteSpace: "normal",
                              },
                            },
                            "解绑"
                          ),
                        ]
                      ),
                    ]
                  );
                },

                (h, params, vm) => {
                  const { haveBinding } = params.row;
                  return h(
                    "Poptip",
                    {
                      props: {
                        transfer: true,
                        confirm: true,
                        title: "你确定要绑定吗?",
                      },
                      style: {
                        display: haveBinding <= 0 ? "" : "none",
                      },
                      on: {
                        "on-ok": () => {
                          vm.$emit("on-choose", params);
                        },
                      },
                    },
                    [
                      h(
                        "Tooltip",
                        {
                          props: {
                            placement: "left",
                            transfer: true,
                            delay: 1000,
                          },
                        },
                        [
                          h("Button", {
                            props: {
                              shape: "circle",
                              size: "small",
                              icon: "md-link",
                              type: "primary",
                            },
                          }),
                          h(
                            "p",
                            {
                              slot: "content",
                              style: {
                                whiteSpace: "normal",
                              },
                            },
                            "绑定"
                          ),
                        ]
                      ),
                    ]
                  );
                },
              ],
            },
          ],
          data: [],
        },
        base: {
          query: {
            totalCount: 0,
            pageSize: 10,
            currentPage: 1,
            kw: "",
            type: 2,
            notbind: 1,
            sort: [
              {
                direct: "ASC",
                field: "name",
              },
            ],
          },
          columns: [
            {
              title: "供应商编码",
              width: 120,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "code",
            },
            {
              title: "供应商名称",
              width: 220,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "name",
            },
            {
              title: "操作",
              align: "center",
              key: "handle",
              width: 150,
              className: "table-command-column",
              options: ["edit"],
              button: [
                (h, params, vm) => {
                  return h(
                    "Tooltip",
                    {
                      props: {
                        placement: "left",
                        transfer: true,
                        delay: 1000,
                      },
                    },
                    [
                      h("Button", {
                        props: {
                          shape: "circle",
                          size: "small",
                          icon: "md-link",
                          type: "info",
                        },
                        on: {
                          click: () => {
                            vm.$emit("on-confirm", params);
                          },
                        },
                      }),
                      h(
                        "p",
                        {
                          slot: "content",
                          style: {
                            whiteSpace: "normal",
                          },
                        },
                        "绑定"
                      ),
                    ]
                  );
                },
              ],
            },
          ],
          data: [],
          styles: {
            height: "calc(100% - 55px)",
            overflow: "auto",
            width: "80%",
            top: "50px",
          },
        },
      },
      styles: {
        height: "calc(100% - 55px)",
        overflow: "auto",
        paddingBottom: "53px",
        position: "static",
      },
      visiableForDialog: false,
      curUser: {},
    };
  },
  computed: {
    ...mapGetters(["billerId"]),
    selectedRows() {
      return this.formModel.selection;
    },
    selectedRowsId() {
      return this.formModel.selection.map((x) => x.id);
    },
  },
  watch: {
    visiableForDialog(newVal, oldVal) {
      if (!newVal) {
        this.curUser = {};
      }
    },
  },
  methods: {
    loadData() {
      queryUPM(Object.assign(this.stores.bind.query)).then((res) => {
        this.stores.bind.data = res.data.data.map((m) => {
          m.createdOn =
            m.createdOn == null
              ? ""
              : dayjs(m.createdOn).format("YYYY-MM-DD HH:mm:ss");
          return m;
        });
        this.stores.bind.query.totalCount = res.data.totalCount;
      });
    },
    loadPartner() {
      queryBaseList(Object.assign(this.stores.base.query)).then((res) => {
        this.stores.base.data = res.data.data.map((m) => {
          return m;
        });
        this.stores.base.query.totalCount = res.data.totalCount;
      });
    },
    rowClsRender(row, index) {
      if (row.isDeleted) {
        return "table-row-disabled";
      }
      return "";
    },
    handleSelect(selection, row) {},
    handleSelectionChange(selection) {
      this.formModel.selection = selection;
    },
    handleRefresh() {
      this.loadData();
    },
    handlerSearch() {
      this.loadData();
    },
    handlePageChanged(page) {
      this.stores.bind.query.currentPage = page;
      this.loadData();
    },
    handlePageSizeChanged(pageSize) {
      this.stores.bind.query.pageSize = pageSize;
      this.loadData();
    },
    handleDelete(params) {
      unBindUPM({
        userId: params.row.guid,
        partnerId: params.row.partnerId,
      }).then((res) => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          //this.loadData();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
    handleChoose(params) {
      this.visiableForDialog = true;
      this.loadPartner();
      this.curUser = params.row;
    },
    handleConfirm(params) {
      if (Object.keys(this.curUser).length == 0) {
      } else {
        bindUPM({
          userId: this.curUser.guid,
          partnerId: params.row.id,
          partnerName: params.row.name,
        }).then((res) => {
          if (res.data.code === 200) {
            this.visiableForDialog = false;
            this.curUser = {};
            this.$Message.success(res.data.message);
            this.loadData();
          } else {
            this.$Message.warning(res.data.message);
          }
        });
      }
    },
    onConfirmeSelect() {},
    handlerSearchPartner() {
      this.loadPartner();
    },
    handleRefresh1() {
      this.loadPartner();
    },
    handlePageChanged1(page) {
      this.stores.base.query.currentPage = page;
      this.loadPartner();
    },
    handlePageSizeChanged1(pageSize) {
      this.stores.base.query.pageSize = pageSize;
      this.loadPartner();
    },
  },
  mounted() {
    this.loadData();
  },
};
</script>
