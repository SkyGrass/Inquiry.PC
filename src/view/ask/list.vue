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
        v-model="stores.ask.data"
        :totalCount="stores.ask.query.totalCount"
        :columns="stores.ask.columns"
        @on-delete="handleDelete"
        @on-edit="handleEdit"
        @on-confirm="handleConfirm"
        @on-audit="handleAudit"
        @on-select="handleSelect"
        @on-selection-change="handleSelectionChange"
        @on-refresh="handleRefresh"
        :row-class-name="rowClsRender"
        @on-page-change="handlePageChanged"
        @on-page-size-change="handlePageSizeChanged"
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
                      v-model="stores.ask.query.kw"
                      placeholder="输入订单号搜索..."
                      @on-search="handleSearchAsk()"
                    />
                  </FormItem>
                </Form>
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

import {
  queryAskListForPartner,
  delAsk,
  auditAsk,
  unAuditAsk,
} from "@/api/ask";
import dayjs from "dayjs";
import { mapGetters } from "vuex";
export default {
  name: "ask_list_page",
  components: {
    Tables,
  },
  data() {
    return {
      commands: {
        delete: { name: "delete", title: "删除" },
        recover: { name: "recover", title: "恢复" },
        forbidden: { name: "forbidden", title: "禁用" },
        normal: { name: "normal", title: "启用" },
      },
      formModel: {
        selection: [],
      },
      stores: {
        ask: {
          query: {
            totalCount: 0,
            pageSize: 20,
            currentPage: 1,
            kw: "",
            isDeleted: 0,
            status: -1,
            sort: [
              {
                direct: "DESC",
                field: "CreatedOn",
              },
            ],
          },
          sources: {
            isDeletedSources: [
              { value: -1, text: "全部" },
              { value: 0, text: "正常" },
              { value: 1, text: "已删" },
            ],
            statusSources: [
              { value: -1, text: "全部" },
              { value: 0, text: "未审批" },
              { value: 1, text: "已审批" },
            ],
          },
          columns: [
            { type: "selection", width: 50, key: "handle" },
            {
              title: "单号",
              key: "displayBillNo",
              width: 120,
              sortable: true,
              align: "center",
            },
            {
              title: "制单日期",
              width: 150,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "date",
            },
            {
              title: "制单人",
              width: 80,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "billerName",
            },

            {
              title: "有效期始",
              width: 120,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "startDate",
            },
            {
              title: "有效期止",
              width: 120,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "endDate",
            },
            {
              title: "存货大类",
              width: 120,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "clsName",
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
                          icon: "md-document",
                          type: "info",
                        },
                        on: {
                          click: () => {
                            vm.$emit("on-confirm", params);
                            vm.$emit("input", params.tableData);
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
                        "去报价"
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
    loadAskList() {
      queryAskListForPartner(this.stores.ask.query).then((res) => {
        this.stores.ask.data = res.data.data
          .map((m) => {
            m.date = dayjs(m.date).format("YYYY-MM-DD HH:mm:ss");
            if (m.status == 1) {
              m.auditDate = dayjs(m.auditDate).format("YYYY-MM-DD HH:mm:ss");
            }
            m.startDate = dayjs(m.startDate).format("YYYY-MM-DD");
            m.endDate = dayjs(m.endDate).format("YYYY-MM-DD");
            return m;
          })
          .reverse();
        this.stores.ask.query.totalCount = res.data.totalCount;
      });
    },
    handleEdit({ row }) {
      this.$router.push({
        name: `ask_form_page`,
        query: {
          id: row.id,
        },
      });
    },
    handleConfirm(params) {
      this.$router.push({
        name: `ask_form_page`,
        query: {
          id: params.row.id,
        },
      });
    },
    handleAudit(params) {
      if (params.row.status == 0) {
        this.doAudit(params.row.id);
      } else {
        this.doUnAudit(params.row.id);
      }
    },
    handleSelect(selection, row) {},
    handleSelectionChange(selection) {
      this.formModel.selection = selection;
    },
    handleRefresh() {
      this.loadAskList();
    },
    handleShowCreateWindow() {
      this.$router.push({
        name: `ask_form_page`,
      });
    },
    handleDelete(params) {
      if (params.row.status == 1) {
        this.$Message.error("询价单已审批,删除请先反审批!");
      } else {
        this.doDelete(params.row.id);
      }
    },
    doDelete(ids) {
      if (!ids) {
        this.$Message.warning("请选择至少一条数据");
        return;
      }
      delAsk({ ids }).then((res) => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadAskList();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
    doAudit(ids) {
      if (!ids) {
        this.$Message.warning("请选择至少一条数据");
        return;
      }
      auditAsk({ id: ids, userId: this.billerId }).then((res) => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadAskList();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
    doUnAudit(ids) {
      if (!ids) {
        this.$Message.warning("请选择至少一条数据");
        return;
      }
      unAuditAsk({ id: ids }).then((res) => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadAskList();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
    handleBatchCommand(command) {
      if (!this.selectedRowsId || this.selectedRowsId.length <= 0) {
        this.$Message.warning("请选择至少一条数据");
        return;
      }
      this.$Modal.confirm({
        title: "操作提示",
        content:
          "<p>确定要执行当前 [" +
          this.commands[command].title +
          "] 操作吗?</p>",
        loading: true,
        onOk: () => {
          this.doBatchCommand(command);
        },
      });
    },
    doBatchCommand(command) {
      delAsk({
        ids: this.selectedRowsId.join(","),
      }).then((res) => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadAskList();
          this.formModel.selection = [];
        } else {
          this.$Message.warning(res.data.message);
        }
        this.$Modal.remove();
      });
    },
    handleSearchAsk() {
      this.loadAskList();
    },
    rowClsRender(row, index) {
      if (row.isDeleted) {
        return "table-row-disabled";
      }
      return "";
    },
    handlePageChanged(page) {
      this.stores.ask.query.currentPage = page;
      this.loadAskList();
    },
    handlePageSizeChanged(pageSize) {
      this.stores.ask.query.pageSize = pageSize;
      this.loadAskList();
    },
  },
  mounted() {
    this.loadAskList();
  },
};
</script>
