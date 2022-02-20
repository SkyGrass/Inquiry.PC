 
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
                      @on-search="handleSearchDept()"
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
import { queryBaseList } from "@/api/base";
import dayjs from "dayjs";
import { mapGetters } from "vuex";
export default {
  name: "base_partner_list_page",
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
            type: 2,
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
      queryBaseList(Object.assign(this.stores.base.query)).then((res) => {
        this.stores.base.data = res.data.data.map((m) => {
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
    handleSearchDept() {
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
  },
  mounted() {
    this.loadData();
  },
};
</script>
