 
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
        v-model="stores.base.data"
        :totalCount="stores.base.query.totalCount"
        :columns="stores.base.columns"
        @on-select="handleSelect"
        @on-selection-change="handleSelectionChange"
        @on-refresh="handleRefresh"
        :row-class-name="rowClsRender"
        @on-page-change="handlePageChanged"
        @on-page-size-change="handlePageSizeChanged"
        @on-delete="handleDelete"
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
                      @on-search="handleSearchWc()"
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
  </div>
</template>

<script>
import Tables from "_c/tables";
import { queryUWM, unBindUWM } from "@/api/bind";
import dayjs from "dayjs";
import { mapGetters } from "vuex";
export default {
  name: "bind_wc_list_page",
  components: {
    Tables,
  },
  data() {
    return {
      formModel: {
        selection: [],
      },
      stores: {
        base: {
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
              title: "微信ID",
              width: 220,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "openId",
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
                  const { openId } = params.row;
                  return h(
                    "Poptip",
                    {
                      props: {
                        transfer: true,
                        confirm: true,
                        title: "你确定要解绑吗?",
                      },
                      style: {
                        display: openId != "" && openId != null ? "" : "none",
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
              ],
            },
          ],
          data: [],
        },
      },
      styles: {
        height: "calc(100% - 55px)",
        overflow: "auto",
        paddingBottom: "53px",
        position: "static",
      },
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
  methods: {
    loadData() {
      queryUWM(Object.assign(this.stores.base.query)).then((res) => {
        this.stores.base.data = res.data.data.map((m) => {
          m.createdOn =
            m.createdOn == null
              ? ""
              : dayjs(m.createdOn).format("YYYY-MM-DD HH:mm:ss");
          return m;
        });
        this.stores.base.query.totalCount = res.data.totalCount;
      });
    },
    handleSelect(selection, row) {},
    handleSelectionChange(selection) {
      this.formModel.selection = selection;
    },
    handleRefresh() {
      this.loadData();
    },
    handleSearchWc() {
      this.loadData();
    },
    rowClsRender(row, index) {
      if (row.isDeleted) {
        return "table-row-disabled";
      }
      return "";
    },
    handlePageChanged(page) {
      this.stores.base.query.currentPage = page;
      this.loadData();
    },
    handlePageSizeChanged(pageSize) {
      this.stores.base.query.pageSize = pageSize;
      this.loadData();
    },
    handleDelete(params) {
      unBindUWM({
        userId: params.row.guid,
        openId: params.row.openId,
      }).then((res) => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadData();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
  },
  mounted() {
    this.loadData();
  },
};
</script>
