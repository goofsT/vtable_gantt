import getAuth from '@/utils/auth'
import { ColumnDefine, VTable,VRender } from '@visactor/vtable-gantt'
import {createGroup, createText, createImage, Tag, CheckBox, Radio} from '@visactor/vtable/es/vrender'
import dirInfo from '@/store/commonDir'
import dayjs from 'dayjs'
import { formatFullDay } from '@/utils/timeFormater'
import {auth} from "@/utils/common";

import Audit from '@/assets/icons/audit.svg'
import AuditDis from '@/assets/icons/audit_dis.svg'

import Add from '@/assets/icons/file-add.svg'
import AddDis from '@/assets/icons/file-add_dis.svg'

import Close from '@/assets/icons/close-square.svg'
import CloseDis from '@/assets/icons/close-square_dis.svg'

import Del from '@/assets/icons/DeleteOutlined.svg'
import DelDis from '@/assets/icons/DeleteOutlined_disabled.svg'
import { Ref } from 'vue'
import getCSSVariable from '@/utils/getCSSVariable'
import { productChildrenFilters, statusMappingColor } from '@/utils/mappings'


const childProduct = productChildrenFilters()




export default function (ganttData: Ref<any[]>,emit:any) {
    const dir = dirInfo()
    const columns = [
        {
            field: 'productId',
            title: '产品',
            width: 90,
            headerStyle: {
                padding: 0,
                textAlign: 'center',
            },
            style: {
                padding: 0,
                autoWrapText: false,
            },
            fieldFormat: (data) => {
                return childProduct.find((item) => item.value === data.productId)?.label
            },
        },
        {
            field: 'name',
            title: '需求名称',
            cellType: 'text',
            width: 300,
            headerStyle: {
                textAlign: 'left',
                padding: 10,
            },
            tooltip: {
                style: { arrowMark: false },
                title: '需求名称',
                placement: VTable.TYPES.Placement.right,
                disappearDelay: 1000,
              },
            style: {
                padding: 0,
                fontSize: 13,
                lineClamp: 2,
                autoWrapText: true,
                cursor: 'pointer',
                textAlign: 'left',
                color: (data: { value: string; row: number;table:any,col:number }) => {
                    const rowData=data.table.getRecordByCell(data.col,data.row)
                    if (dir.productDemandType.find((d) => d.id === rowData?.type)?.dictName?.includes('BUG')) {
                        return 'red'
                    } else {
                        return '#1677ff'
                    }
                },
            },
            customRender: (args) => {
                const { width, height } = args.rect || { width: 0, height: 0 }
                const rowData = args.table.getRecordByCell(args.col,args.row)
                const isBug=dir.productDemandType.find((d) => d.id === rowData?.type)?.dictName?.includes('BUG')
                const elements = []
                let left=0
                if(rowData?.urgent){
                    elements.push({
                        name:'urgent',
                        type: 'rect',
                        fill: 'red',
                        x: 0,
                        y: height/2-10,
                        width: 20,
                        height: 22
                      })
                      elements.push({
                        name:'urgent',
                        type: 'text',
                        text: '急',
                        fill: '#fff',
                        fontSize: 12,
                        x: 4,
                        y: height/2+5,
                      })
                      left+=20
                }
                if(rowData.exceptionClose && rowData.status==='已关闭'){
                    elements.push({
                        name:'exceptionClose',
                        type: 'rect',
                        fill: 'orange',
                        x: left+2,
                        y: height/2-10,
                        width: 25,
                        height: 22
                      })
                      elements.push({
                        name:'exceptionClose',
                        type: 'text',
                        text: '异常',
                        fill: '#fff',
                        fontSize: 12,
                        x: left+2,
                        y: height/2+5,
                      })
                      left+=30
                }
                if(rowData?.taskCount){
                    elements.push({
                        name:'taskCount',
                        type: 'rect',
                        pickable:true,
                        fill: 'rgb(103,132,209)',
                        x: left+2,
                        y: height/2-10,
                        width: 25,
                        height: 22,
                        cursor: 'pointer',
                      })
                      elements.push({
                        name:'taskCount',
                        type: 'text',
                        pickable:true,
                        text: rowData?.taskCount,
                        cursor: 'pointer',
                        fill: '#fff',
                        fontSize: 12,
                        x: left+5,
                        y: height/2+5,
                      })
                      left+=30
                }
                elements.push({
                    type: 'text',
                    fill: isBug?'red':'#1677ff',
                    fontSize: 12,
                    fontWeight: 500,
                    maxLineWidth:width-left-10,
                    textBaseline: 'middle',
                    text: rowData.name,
                    x: left,
                    y: height/2,
                })
                return {
                    elements,
                    expectedHeight:height,
                    expectedWidth: width
                }

            }
        },
        {
            field: 'projectInfo.name',
            title: '项目',
            width: 150,
            headerStyle: {
                padding: 0,
                textAlign: 'center',
            },
            style: {
                padding: 0,
                autoWrapText: false,
            },
        },
        {
            field: 'branchInfo.name',
            title: '组织',
            width: 100,
            headerStyle: {
                padding: 0,
                textAlign: 'center',
            },
            style: {
                padding: 0,
                autoWrapText: false,
            },
        },
        {
            field: 'type',
            title: '类型',
            width: 70,
            headerStyle: {
                padding: 0,
                textAlign: 'center',
            },
            style: {
                padding: 0,
                autoWrapText: false,
            },
            fieldFormat: (data) => {
                return dir.productDemandType.find((item) => item.id === data.type)?.dictName
            },
        },
        {
            field: 'status',
            title: '状态',
            headerStyle: { padding: 0 },
            cellType: 'text',
            width: 60,
            style: {
                padding: 0,
                textAlign: 'center',
                fontSize: 12,
                autoWrapText: true,
                color: (data: { value: string }) => {
                    return statusMappingColor[data.value as keyof typeof statusMappingColor] || '#000'
                },
                bgColor: (data: { value: string }) => {
                    return getCSSVariable('--vxe-ui-layout-background-color')
                },
                fontWeight: 500,
            },
            customRender: (args) => {
                if (args.row === 0 || args.col === 0) return null
                const { width } = args.rect || { width: 0, height: 0 }
                const { dataValue, value } = args
                const elements = []
                let top = 40
                let maxWidth = 0
                elements.push({
                    type: 'text',
                    fill: statusMappingColor[value as keyof typeof statusMappingColor] || '#000',
                    fontSize: 12,
                    fontWeight: 500,
                    textBaseline: 'middle',
                    textAlign: 'center',
                    text: dataValue,
                    x: width / 2,
                    y: top - 19,
                })
                return {
                    elements,
                    expectedHeight: top + 20,
                    expectedWidth: maxWidth + 20,
                }
            },
        },

        {
            field: 'userInfo.name',
            title: '负责',
            cellType: 'text',
            width: 50,
            style: { padding: 0 },
            headerStyle: { padding: 0 },
        },
        {
            field: 'submitInfo.name',
            title: '提交',
            cellType: 'text',
            width: 50,
            style: { padding: 0 },
            headerStyle: { padding: 0 },
        },
        {
            field: 'actualHours',
            title: '工时(h)',
            cellType: 'text',
            width: 95,
            style: {
                padding: 0,
            },
            customRender: (args) => {
                const { width, height } = args.rect || { width: 0, height: 0 }
                const rowData=args.table.getRecordByCell(args.col,args.row)
                const elements = []
                const textArr=[
                    {
                        text: `估:${rowData.estimateHours}`,
                        fill: 'orange',
                        x: 0,
                    },
                    {
                        text: `任:${rowData.taskHours}`,
                        fill: '#1677ff',
                        x: 35,
                    },
                    {
                        text: `测:${rowData.testHours}`,
                        fill: '#46ca1f',
                        x: 65,
                    }
                ]
                elements.push(...textArr.map((item,index)=>{
                    return {
                        type: 'text',
                        fontSize:12,
                        y:height/2+5,
                        ...item
                    }
                }))

                return {
                    elements,
                    expectedHeight:height,
                    expectedWidth: width
                }
            },
        },
        {
            field: 'createTime',
            title: '提交时间',
            cellType: 'text',
            sort:true,
            width: 85,
            style: { padding: 0 },
            headerStyle: { padding: 0 },
            fieldFormat: (data: any) => {
                return formatFullDay(data.createTime)
            },
        },
        {
            field: 'endTime',
            title: '期望完成',
            cellType: 'text',
            sort:true,
            width: 85,
            style: { padding: 0 },
            headerStyle: { padding: 0 },
            fieldFormat: (data: any) => {
                return formatFullDay(data.endTime)
            },
        },
        {
            field: 'updatable',
            title: '编辑',
            cellType: 'text',
            width: 60,
            style: { padding: 0 },
            headerStyle: { padding: 0 },
            customLayout: (args) => {
                const { table, row, col, rect } = args;
                const { height, width } = rect ?? table.getCellRect(col, row);
                const rowData=table.getRecordByCell(col,row)

                const container =  createGroup({
                    height,
                    width,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    flexDirection: 'row',
                    flexWrap: 'nowrap'
                  });
                  const checkbox = new CheckBox({
                    checked:rowData?.updatable,
                    disabled:rowData?.status === '已关闭',
                    text: {
                      text: rowData?.updatable?'是':'否',
                      fontSize: 12,
                      fill:rowData?.updatable?'green':'red'
                    },
                    spaceBetweenTextAndIcon: 2,
                    boundsPadding: [0, 10, 0, 0]
                  });
                  checkbox.render();
                  checkbox.addEventListener('checkbox_state_change', (e:any) => {
                    if (rowData?.status === '已关闭') return
                    emit('changeUpdate',rowData)
                  });
                  container.add(checkbox)
                return {
                    rootContainer: container
                }
            }
            
        },

        {
            field: 'operation',
            cellType: 'text',
            title: '操作',
            width: 130,
            headerStyle: { padding: 0 },
            style: { padding: 5 },
            customLayout: (args) => {
                const { table, row, col, rect } = args;
                const rowData=table.getRecordByCell(col,row)
                const { height, width } = rect ?? table.getCellRect(col, row);
                const container = 
                createGroup({
                    height,
                    width,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    flexDirection: 'row',
                    flexWrap: 'nowrap'
                  });
                  const iconAudit = createImage({
                    width: 23,
                    height: 23,
                    image:rowData?.status==='待审核'? Audit:AuditDis,
                    cornerRadius: 25,
                    cursor: rowData?.status==='待审核'?'pointer':'not-allowed',
                    onclick:()=>{
                        if(rowData?.status!=='待审核'){
                            return
                        }
                        emit('doAudit',rowData)
                    },
                  });
                  const iconAdd = createImage({
                    width: 20,
                    height: 20,
                    image:/进行中|待发布|已立项/.test(rowData?.status) && getAuth('productTask','add') ?Add:AddDis,
                    cornerRadius: 25,
                    cursor: /进行中|待发布|已立项/.test(rowData?.status) && getAuth('productTask','add')?'pointer':'not-allowed',
                    onclick:()=>{
                        if(!(/进行中|待发布|已立项/.test(rowData?.status) && getAuth('productTask','add'))){
                            return
                        }
                        emit('doAdd',rowData)
                    },
                  });
                  const iconClose = createImage({
                    width: 20,
                    height: 20,
                    image:( !/已关闭/.test(rowData?.status) && auth.handleProductDemand(rowData) && getAuth('productRequire','update'))?Close:CloseDis,
                    cornerRadius: 25,
                    cursor: !/已关闭/.test(rowData?.status) && auth.handleProductDemand(rowData) && getAuth('productRequire','update')?'pointer':'not-allowed',
                    onclick:()=>{
                        if(!(!/已关闭/.test(rowData?.status) && auth.handleProductDemand(rowData) && getAuth('productRequire','update'))){
                            return
                        }
                        emit('doClose',rowData)
                    },
                  });
                  const iconDel=createImage({
                    width: 20,
                    height: 20,
                    image:rowData.status==='已关闭' && getAuth('productRequire','delete')?Del:DelDis,
                    cornerRadius: 25,
                    cursor: rowData.status==='已关闭' && getAuth('productRequire','delete')?'pointer':'not-allowed',
                    onclick:()=>{
                        if(!(rowData.status==='已关闭' && getAuth('productRequire','delete'))){
                            return
                        }
                        emit('del',rowData)
                    },
                  });
                container.add(iconAudit)
                container.add(iconAdd)
                container.add(iconClose)
                container.add(iconDel)
                return {
                    rootContainer: container
                }
            }
        },
    ] as ColumnDefine[]

    return columns
}
