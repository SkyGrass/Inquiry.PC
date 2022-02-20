 
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
        v-model="stores.subsummery.data"
        :totalCount="stores.subsummery.query.totalCount"
        :columns="stores.subsummery.columns"
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
                    <DatePicker
                      type="date"
                      placeholder="开始日期"
                      v-model="stores.subsummery.query.startDate"
                      style="width: 200px"
                    ></DatePicker>
                  </FormItem>
                  <FormItem>
                    <DatePicker
                      type="date"
                      placeholder="结束日期"
                      v-model="stores.subsummery.query.endDate"
                      style="width: 200px"
                    ></DatePicker>
                  </FormItem>
                  <FormItem>
                    <Select
                      v-model="stores.subsummery.query.deptId"
                      @on-change="handleSearchRpt"
                      :clearable="true"
                      placeholder="申领部门"
                      style="width: 140px"
                    >
                      <Option
                        v-for="item in stores.subsummery.sources.deptList"
                        :value="item.id"
                        :key="item.id"
                        >{{ item.name }}</Option
                      >
                    </Select>
                  </FormItem>
                  <FormItem>
                    <Input
                      type="text"
                      search
                      :clearable="true"
                      v-model="stores.subsummery.query.kw"
                      placeholder="输入存货名称搜索..."
                      @on-search="handleSearchRpt()"
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
                      <Button
                        icon="md-download"
                        title="导出"
                        @click="handleExportCsv"
                        >导出当前页</Button
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

import { querySubSummeryRpt } from "@/api/rpt";
import { queryDeptList } from "@/api/base";
import dayjs from "dayjs";
import { mapGetters } from "vuex";
export default {
  name: "rpt_subsummery_page",
  components: {
    Tables,
  },
  data() {
    return {
      formModel: {
        selection: [],
      },
      stores: {
        subsummery: {
          query: {
            totalCount: 0,
            pageSize: 20,
            currentPage: 1,
            kw: "",
            deptId: "-1",
            startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
            endDate: dayjs().format("YYYY-MM-DD"),
            sort: [
              {
                direct: "DESC",
                field: "DetpName",
              },
            ],
          },
          columns: [
            {
              title: "申购日期",
              width: 150,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "date",
            },
            {
              title: "存货名称",
              width: 220,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "name",
            },
            {
              title: "存货编码",
              width: 120,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "code",
            },
            {
              title: "存货单位",
              width: 80,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "unitname",
            },
            {
              title: "存货规格",
              width: 220,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "specification",
            },
            {
              title: "申领数量",
              width: 120,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "count",
            },
            {
              title: "签收数量",
              width: 120,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "finishCount",
            },
            {
              title: "申领部门",
              width: 120,
              ellipsis: true,
              tooltip: true,
              align: "center",
              key: "deptName",
            },
          ],
          sources: {
            deptList: [],
          },
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
    loadRpt() {
      querySubSummeryRpt(
        Object.assign({}, this.stores.subsummery.query, {
          startDate: dayjs(this.stores.subsummery.query.startDate).format(
            "YYYY-MM-DD"
          ),
          endDate: dayjs(this.stores.subsummery.query.endDate).format(
            "YYYY-MM-DD"
          ),
        })
      ).then((res) => {
        this.stores.subsummery.data = res.data.data.map((m) => {
          return m;
        });
        this.stores.subsummery.query.totalCount = res.data.totalCount;
      });
    },
    handleSelect(selection, row) {},
    handleSelectionChange(selection) {
      this.formModel.selection = selection;
    },
    handleRefresh() {
      this.loadRpt();
    },
    handleSearchRpt() {
      this.loadRpt();
    },
    rowClsRender(row, index) {
      if (row.isDeleted) {
        return "table-row-disabled";
      }
      return "";
    },
    handlePageChanged(page) {
      this.stores.subsummery.query.currentPage = page;
      this.loadRpt();
    },
    handlePageSizeChanged(pageSize) {
      this.stores.subsummery.query.pageSize = pageSize;
      this.loadRpt();
    },
    handleExportCsv() {
      this.$refs.tables.exportCsv({
        filename: "申领汇总表",
      });
    },
    getDeptList() {
      queryDeptList().then((res) => {
        this.stores.subsummery.sources.deptList = res.data.data.map((m) => {
          return m;
        });
      });
    },
  },
  mounted() {
    this.getDeptList();
    this.loadRpt();
  },
};
</script>
