import { defineComponent, ref, onMounted, onBeforeUnmount, PropType, watch, nextTick } from 'vue';
import { Gantt, TYPES } from '@visactor/vtable-gantt'
import { VTable } from '@visactor/vue-vtable'
import GetOptions from './options'
import handleClickCell from './handleClick'
import dayjs from 'dayjs'
import { useDark } from '@vueuse/core'
import { theme } from 'ant-design-vue'

export default defineComponent({
    props: {
        data: Array as PropType<any[]>,
        page: Object as PropType<any>
    },
    emits: ['changeUpdate', 'showTask', 'doAudit', 'doAdd', 'doClose', 'del', 'updateData'],
    setup(props, { emit, expose }) {

        let ganttInstance: Gantt
        let tableInstance: VTable.ListTable
        const gantRef = ref<HTMLElement>()
        const ganttData = ref<any[]>([])
        const isDark = useDark()
        const { useToken } = theme
        const { token } = useToken()


        // 处理数据，添加甘特图所需的日期字段格式
        const processData = () => {
            if (!props.data || !props.data.length) return []
            return props.data.map(item => {
                item.end = dayjs(item.endTime).format('YYYY-MM-DD')
                return item
            })
        }

        // 初始化甘特图
        const initGantt = () => {
            if (!gantRef.value) return
            ganttData.value = processData()
            const option = GetOptions(ganttData, emit, token, isDark,props.page)
            ganttInstance = new Gantt(gantRef.value, option as any)
            tableInstance = ganttInstance.taskListTableInstance as unknown as VTable.ListTable
            tableInstance.on(VTable.TABLE_EVENT_TYPE.CLICK_CELL,
                handleClickCell({
                    tableInstance,
                    ganttData: ganttData,
                    emitEvent: (name: string, data?: any) => emit(name as any, data)
                }))
            tableInstance.on('mouseenter_cell', (args) => {
                const { col, row } = args;
                const tipCol = [2, 3]
                if (tipCol.includes(col) && row >= 1) {
                    showTooltip(col, row)
                }
            });
            tableInstance.updateSortState({
                field: 'endTime',
                order: 'asc',
            })
        }

        // 显示tooltip
        const showTooltip = (col: number, row: number) => {
            const rect = tableInstance.getVisibleCellRangeRelativeRect({ col, row });
            tableInstance.showTooltip(col, row, {
                content: tableInstance.getCellValue(col, row),
                referencePosition: { rect, placement: VTable.TYPES.Placement.top },
                className: 'defineTooltip',
                style: {
                    bgColor: 'black',
                    color: 'white',
                    arrowMark: true,
                },
                disappearDelay: 100,
            });
        }

        // 更新甘特图数据
        const updateGantt = () => {
            if (!ganttInstance) return
            ganttData.value = processData()
            ganttInstance.setRecords(ganttData.value)
            ganttInstance.scrollTop=0
        }

        // 监听数据变化
        watch(() => props.data, (val) => {
            updateGantt()
        })

        watch(isDark, (val: boolean) => {
            nextTick(() => {
                if (!gantRef.value) return
                ganttInstance?.release()
                initGantt()
            })
        })

        onMounted(() => {
            initGantt()
        })

        onBeforeUnmount(() => {
            ganttInstance?.release()
        })

        expose({
            getChecked: () => {
                if (!tableInstance) return []
                return tableInstance.getCheckboxState()
            }
        })

        // 已经在expose中定义了getChecked方法
        return () => {
            return <div class="w-full h-full">
                <div id="gantt-container" ref={gantRef} class="w-full h-full"></div>
            </div>
        }
    }
})



