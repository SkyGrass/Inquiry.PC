<template>
    <Card :padding="5" dis-hover ref="card">
        <div style="text-align:center">
            <Row style="margin:5px">
                <Col span="3">
                <Button>第一级</Button>
                </Col>
                <Col span="10">
                <Select label-in-value multiple v-model="userList_Level1">
                    <Option v-for="item in userList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
                </Col>
            </Row>
            <Row style="margin:5px">
                <Col span="3">
                <Button>第二级</Button>
                </Col>
                <Col span="10">
                <Select label-in-value multiple v-model="userList_Level2">
                    <Option v-for="item in userList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
                </Col>
            </Row>

            <Row style="margin:5px" type="flex">
                <Col span="10" :offset="3">
                <Button style="width:160px" type="primary" @click="handleSave">保存</Button>
                </Col>
            </Row>
        </div>
    </Card>
</template>
<script>
import {
    getUserList,
} from "@/api/rbac/user";
import { saveAuditFlow, querySgFlowInfo } from '@/api/bind'
export default {
    name: `bind_auidt_form`,
    data() {
        return {
            userList: [],
            userList_Level1: [],
            userList_Level2: [],
            stores: {
                user: {
                    query: {
                        totalCount: 0,
                        pageSize: 999,
                        currentPage: 1,
                        kw: "",
                        isDeleted: 0,
                        status: -1,
                        sort: [
                            {
                                direct: "DESC",
                                field: "Guid"
                            }
                        ]
                    },
                }
            },
        }
    },
    methods: {
        loadUserList() {
            getUserList(this.stores.user.query).then(({ data: { data } }) => {
                this.userList = data.map(m => {
                    return {
                        id: m.guid,
                        name: m.displayName
                    }
                })

                this.getFlowInfo();
            });
        },
        getFlowInfo() {
            querySgFlowInfo({}).then(({ data: { data } }) => {
                this.userList_Level1 = data.filter(f => f.no == 0).map(m => m.userGuid)
                this.userList_Level2 = data.filter(f => f.no == 1).map(m => m.userGuid)
            });
        },
        handleSave() {
            if (this.userList_Level1.length <= 0) {
                return this.$Message.error('一级审批的人员设置不正确!')
            }
            else if (this.userList_Level2.length <= 0) {
                return this.$Message.error('二级审批的人员设置不正确!')
            }
            else {
                let t1 = this.userList_Level1.map(m => {
                    return {
                        billTypeId: 1,
                        userGuid: m,
                        userName: this.userList.filter(f => f.id == m)[0]['name'],
                        no: 0
                    }
                })
                let t2 = this.userList_Level2.map(m => {
                    return {
                        billTypeId: 1,
                        userGuid: m,
                        userName: this.userList.filter(f => f.id == m)[0]['name'],
                        no: 1
                    }
                })
                const t = t1.concat(t2);
                this.$Modal.confirm({
                    title: "保存确认",
                    content: "保存后审批流程将被更新 \r\n 确定要继续吗?",
                    okText: "保存",
                    cancelText: "再想想",
                    loading: true,
                    onOk: () => {
                        saveAuditFlow(t).then(({ data: { code, data, message } }) => {
                            if (code == 200) {
                                this.$Message.success({
                                    duration: 1,
                                    content: '保存成功!',
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
            }
        }
    },
    mounted() {
        this.loadUserList();
    }
}
</script>
