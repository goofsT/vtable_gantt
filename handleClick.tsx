import { MousePointerCellEvent } from '@visactor/vtable'
import { Gantt } from '@visactor/vtable-gantt'
import {modalUtilsDemand}  from '@/utils/hooks/useDemandDetailModal'
const { openDemandDetail } = modalUtilsDemand
export default function handleClickCell(data: {
    tableInstance: any,
    ganttData:any,
    emitEvent:(name:string,data?:any)=>void
  }) {
    return (args: MousePointerCellEvent) => {
      if (args.col === 2 && args.row) {
        // 检查是否点击了taskCount元素
        if (args.target?.name === 'taskCount') {
          const rowData=args?.originData || data.tableInstance.getRecordByCell(args.col,args.row)
          data.emitEvent('showTask',rowData?.id)
        }else{
          const rowData=data.tableInstance.getRecordByCell(args.col,args.row)
          rowData && openDemandDetail(rowData.id,true,()=>data.emitEvent('updateData'))
        }
      }else if(args.col===13){
        //点击操作按钮
        const iconCallBack = args.target && (args.target as any).attribute ? 
                            (args.target as any).attribute.onclick : undefined
        if(typeof iconCallBack === 'function'){
          iconCallBack()
        }
      }
    }
  }