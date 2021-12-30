<template>
    <Card :padding="5" dis-hover ref="card">
        <div style="text-align:center">
            <Row :gutter="16" style="line-height: 32px;padding:5px" v-if="curBillNo!=''">
                <Col span="2"> 单号
                </Col>
                <Col span="3">
                <Input v-model="curBillNo" readonly/>
                </Col>
            </Row>
            <Row :gutter="16" style="line-height: 32px;padding:5px">
                <Col span="2"> 报价有效期
                </Col>
                <Col span="3">
                <DatePicker style="width: 100%;" :disabled="isAuditDone" format='yyyy-MM-dd' v-model='startDate' type="date" confirm placeholder="选择开始日期"></DatePicker>
                </Col>
                <Col span="1">至</Col>
                <Col span="3">
                <DatePicker style="width: 100%;" :disabled="isAuditDone" format='yyyy-MM-dd' v-model='endDate' type="date" confirm placeholder="选择结束日期"></DatePicker>
                </Col>
            </Row>
            <Row :gutter="16" style="line-height: 32px;padding:5px">
                <Col span="2"> 存货大类
                </Col>
                <Col span="3">
                <Select clearable v-model="curInvClsId" :disabled="isAuditDone">
                    <Option v-for="item in invCls" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
                </Col>
                <Col span="1">
                <Button type="primary" @click="handleSave" :disabled="isAuditDone">保存</Button>
                </Col>
                <Col span="1" :offset="1">
                <Button type="info" @click="handleNotity" :disabled="isAuditDone" v-if="canPush">通知供应商</Button>
                </Col>
            </Row>
            <Row style=" padding:5px">
                <Col>
                <Table border :columns="columns" :data="tableData" :height="height"></Table>
                </Col>
            </Row>
        </div>
    </Card>
</template>
<script>
import { queryInvList } from '@/api/inv.js'
import { queryClsList } from '@/api/cls.js'
import { queryInvPrice, saveForm, updateForm, loadAsk, loadAskRecord, notify } from '@/api/ask.js'

import { groupBy, copyObj } from '@/libs/util.js'
import { columns_inv } from './columns_inv'
import dayjs from 'dayjs'
import { mapGetters, mapMutations } from 'vuex'
export default {
    name: `in_form_page`,
    data() {
        return {
            curInvClsId: '',
            startDate: new Date(),
            endDate: dayjs().add(15, 'day').toDate(),
            height: 0,
            invCls: [],
            orignData: [],
            clsPartnersList: [],
            columnsStatic: [
                {
                    title: '市场价',
                    key: 'p_market_price',
                    width: 80,
                    align: 'center',
                    fixed: 'right',
                    role: [-1],
                    render: (h, params) => {
                        const { index } = params
                        const { key } = params.column
                        return h('div', [
                            h('InputNumber', {
                                props: {
                                    min: 0,
                                    value: params.row[key],
                                    readonly: this.isAuditDone
                                },
                                style: {
                                    width: '100%'
                                },
                                on: {
                                    input: (e) => {
                                        this.tableData[index][key] = e;
                                    }
                                }
                            }),
                        ]);
                    }
                },
                {
                    title: '操作',
                    key: 'action',
                    fixed: 'right',
                    align: 'center',
                    width: 80,
                    render: (h, params) => {
                        const { index } = params
                        const { key } = params.column
                        return h('div', [
                            h('Button', {
                                props: {
                                    type: 'text',
                                    size: 'small',
                                    icon: 'md-trash',
                                    disabled: this.isAuditDone
                                },
                                on: {
                                    click: (a, b) => {
                                        this.tableData.splice(index, 1);
                                    }
                                }
                            }, '删除'),

                        ]);
                    }
                }
            ],
            columnsDynamic: [],
            tableData: [],
            curBillNo: '',
            validInvs: [],
            isAuditDone: false
        }
    },
    computed: {
        ...mapGetters(['billerId']),
        columns() {
            return columns_inv.concat(this.columnsDynamic).concat(this.columnsStatic)
        },
        startDateStr() {
            return dayjs(this.startDate).format("YYYY-MM-DD");
        },
        endDateStr() {
            return dayjs(this.endDate).format("YYYY-MM-DD");
        },
        isAddState() {
            return this.$route.query.id == void 0
        },
        formData() {
            let form = []
            this.clsPartnersList.forEach(p => {
                form = form.concat(this.tableData.filter(f => f.canShow == true).map(m => {
                    return {
                        partnerId: p.idParent,
                        invId: m.id,
                        priceLast: m['p_last_price_' + p.idParent],
                        priceLastConfirm: m['p_last_confirm_price_' + p.idParent],
                        priceMarket: m.p_market_price,
                        remark: ''
                    }
                }))
            })

            return form;
        },
        canPush() {
            return this.$route.query.id != void 0
        }
    },
    watch: {
        curInvClsId(newVal, oldVal) {
            if (newVal != oldVal) {
                this.clsPartnersList = this.orignData.filter(f => f.idinventoryclass == newVal);
                this.columnsDynamic = [];
                this.clsPartnersList.forEach((p, i) => {

                    this.columnsDynamic.push({
                        width: 150,
                        align: 'center',
                        key: 'p_' + p.idParent,
                        role: [-1, p.idParent],
                        title: p.partnerName,
                        children: [{
                            key: 'p_last_price_' + p.idParent,
                            width: 150,
                            align: 'center',
                            role: [-1, p.idParent],
                            title: '上期报价'
                        }, {
                            key: 'p_last_confirm_price_' + p.idParent,
                            width: 150,
                            align: 'center',
                            role: [-1, p.idParent],
                            title: '上期确认报价'
                        }]
                    })
                    // this.columnsDynamic.push({
                    //     key: 'p_last_price_' + p.idParent,
                    //     width: 150,
                    //     align: 'center',
                    //     role: [-1, p.idParent],
                    //     renderHeader: (h, params) => {
                    //         return h('div', [
                    //             h('p', p.partnerName),
                    //             h('p', '上期报价'),
                    //         ])
                    //     }
                    // })

                    // this.columnsDynamic.push({
                    //     key: 'p_last_confirm_price_' + p.idParent,
                    //     width: 150,
                    //     align: 'center',
                    //     role: [-1, p.idParent],
                    //     renderHeader: (h, params) => {
                    //         return h('div', [
                    //             h('p', p.partnerName),
                    //             h('p', '上期确认报价'),
                    //         ])
                    //     }
                    // })

                }, this);

                this.getInvList(newVal)
            }
        }
    },
    methods: {
        ...mapMutations([
            'closeTag'
        ]),
        getInvList(clsId) {
            queryInvPrice({
                clsId
            }).then(({ data: { code, data, message } }) => {
                if (code == 200) {
                    this.height = document.querySelector('.content-wrapper').offsetHeight - 64 * 2
                    this.tableData = data.map(m => {
                        m.p_market_price = 0;
                        if (this.validInvs.length > 0) {
                            m.canShow = this.validInvs.findIndex(f => f == m.id) > -1
                        } else {
                            m.canShow = 1
                        }
                        return m;
                    }).filter(f => f.canShow == true)

                    if (this.$route.query.id) {
                        this.getInvMarkPrice();
                    }
                }

            });
        },
        getInvMarkPrice() {
            loadAsk({ id: this.$route.query.id }).then(({ data: { code, data, message } }) => {
                if (code == 200) {
                    this.tableData.forEach((row, index) => {
                        const t = data.filter(f => f.invId == row.id)[0]
                        row['p_market_price'] = t.priceMarket
                        this.$set(this.tableData, index, row)
                    })
                }
            });
        },
        handleSave() {
            if (this.formData.length <= 0) {
                return this.$Message.error('没有存货数据!');
            }
            // if (this.formData.some(f => f.priceMarket <= 0)) {
            //     return this.$Message.error('发现存货尚未录入市场价!');
            // } else {
            if (this.$route.query.id) {
                const billNo = this.curBillNo
                this.$Modal.confirm({
                    title: "保存确认",
                    content: "保存单据将清空本单据供应商报价 \r\n 确定要继续吗?",
                    okText: "保存",
                    cancelText: "再想想",
                    loading: true,
                    onOk: () => {
                        updateForm({
                            inquiry: {
                                billerId: this.billerId,
                                id: this.$route.query.id,
                                startDate: this.startDateStr,
                                endDate: this.endDateStr
                            },
                            inquiryEntry: this.formData,
                            context: [{ name: `${billNo}_ShopCar`, entry: this.tableData }]
                        }).then(({ data: { code, data, message } }) => {
                            if (code == 200) {
                                this.$Message.success({
                                    duration: 1,
                                    content: '保存成功!',
                                    onClose: () => {
                                        this.$router.push({
                                            name: `in_form_page`,
                                            query: {
                                                id: this.$route.query.id
                                            }
                                        })
                                    }
                                })
                            }
                            else {
                                this.$Modal.error({
                                    title: '提示',
                                    content: message
                                })
                            }

                            this.$Modal.remove();
                        });
                    }
                });
            } else {
                const billNo = new Date() * 1
                saveForm({
                    inquiry: {
                        billerId: this.billerId,
                        billNo,
                        startDate: this.startDateStr,
                        endDate: this.endDateStr
                    },
                    inquiryEntry: this.formData,
                    context: [{ name: `${billNo}_ShopCar`, entry: this.tableData }]
                }).then(({ data: { code, data, message } }) => {
                    if (code == 200) {
                        this.$Message.success({
                            duration: 1,
                            content: '保存成功!',
                            onClose: () => {
                                const { id } = data;
                                this.$router.push({
                                    name: `in_list_page`
                                })
                                setTimeout(function() {
                                    this.closeTag({ name: 'in_form_page', })
                                }, 1000);

                            }
                        })
                    }
                    else {
                        this.$Modal.error({
                            title: '提示',
                            content: message
                        })
                    }
                });
            }
            // }
        },
        handleNotity() {
            this.$Modal.confirm({
                title: "通知供应商",
                content: "确定要通知相关供应商去报价吗?",
                okText: "确定",
                cancelText: "再想想",
                loading: true,
                onOk: () => {
                    this.clsPartnersList.forEach(p => {
                        notify({ id: p.idParent, billId: this.$route.query.id }).then(({ data: { code, data, message } }) => {

                            if (code == 200) {
                                this.$Modal.remove();
                            }
                        })
                    });
                }
            });
        }
    },
    mounted() {
        this.invCls = []
        queryClsList().then(({ data: { code, data, message } }) => {
            if (code == 200) {
                let t = groupBy(data, 'idinventoryclass')
                this.orignData = data;
                t.forEach(rows => {
                    this.invCls.push({
                        id: rows[0].idinventoryclass,
                        name: rows[0].invClsName
                    })
                }, this);

                if (this.$route.query.id) {
                    loadAsk({ id: this.$route.query.id }).then(({ data: { code, data, message } }) => {
                        this.curInvClsId = data[0]['clsId'];
                        this.curBillNo = data[0]['billNo'];
                        this.isAuditDone = data[0]['status'] == 1
                        this.startDate = new Date(data[0]['startDate'])
                        this.endDate = new Date(data[0]['endDate'])
                        this.validInvs = Array.from(new Set(data.map(m => m.invId)));
                    });
                }
            }
        })




    }
}
</script>
<style lang="less">

</style>

