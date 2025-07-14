import getCSSVariable from '@/utils/getCSSVariable'
import { statusMappingColor } from '@/utils/mappings'
import dayjs from 'dayjs'
import { VRender, Gantt } from '@visactor/vtable-gantt'
import { useWindowSize } from '@vueuse/core'
import emptyIcon from '@/assets/images/empty-svg.svg'
import GetColumns from './columns'
import { Ref } from 'vue'
export default function (records: Ref<any[]>,emit:any,token:Ref<any>,isDark:Ref<boolean>,page:any) { 
    const { width } = useWindowSize()
    return {
        overscrollBehavior: 'none',
        records: records.value,
        taskListTable: {
            overscrollBehavior: 'none',
            editCellTrigger: 'click',
            columns: GetColumns(records,emit),
            columnResizeMode: 'none',
            emptyTip: {
                text: '暂无数据',
                icon: {
                    image:emptyIcon,
                    width: 180,
                    height: 180,
                },
            },
            frozenColCount: 1,
            rightFrozenColCount: 1,
            leftFrozenColCount: 1,
            minTableWidth: 500,
            maxTableWidth: width.value * 0.8,

            rowSeriesNumber: {
                title: '#',
                dragOrder: false,
                cellType: 'checkbox',
                disableColumnResize: true,
                format: (_col: number, row: number) => {
                    return page ? (page.size * (page.page - 1) + row) : ''
                },
                headerStyle: {
                    bgColor: getCSSVariable('--vxe-ui-table-header-background-color'),
                    borderColor: getCSSVariable('--vxe-ui-table-border-color')
                },
                style: {
                    borderColor: getCSSVariable('--vxe-ui-table-border-color')
                }
            },
            theme: {
                tooltipStyle: {
                    maxWidth: 100,
                },
                headerStyle: {
                    textAlign: 'center',
                    borderColor: getCSSVariable('--vxe-ui-table-border-color'),
                    borderLineWidth: 1,
                    fontFamily: getCSSVariable('--vxe-ui-font-family'),
                    fontSize: Number(getCSSVariable('--vxe-ui-font-size-default').slice(0, -2)) - 2,
                    fontWeight: getCSSVariable('--vxe-ui-table-header-font-weight'),
                    color: getCSSVariable('--vxe-ui-font-color'),
                    bgColor: getCSSVariable('--vxe-ui-table-header-background-color'),
                    frameStyle: {
                      borderColor: getCSSVariable('--vxe-ui-table-border-color'),
                      borderLineWidth: 1,
                    },
                  },
                  bodyStyle: {
                    fontSize: 13,
                    textAlign: 'center',
                    borderColor: getCSSVariable('--vxe-ui-table-border-color'),
                    borderLineWidth: 1,
                    color: token.value.colorText,
                    bgColor: getCSSVariable('--vxe-ui-layout-background-color'),
                    hover: {
                      cellBgColor: isDark.value ? '#fff2' : '#0002',
                    },
                  },
                selectionStyle: {
                    cellBgColor: isDark.value ? '#fff2' : '#0002',
                },
            },
        },
        frame: {
            outerFrameStyle: {
                borderLineWidth: 1,
                borderColor: getCSSVariable('--vxe-ui-table-border-color'),
                cornerRadius: 4
            },
            verticalSplitLine: {
                lineColor: getCSSVariable('--vxe-ui-table-border-color'),
                lineWidth: 1
            },
            horizontalSplitLine: {
                lineColor: getCSSVariable('--vxe-ui-table-border-color'),
                lineWidth: 1
            },
            verticalSplitLineMoveable: true,
            verticalSplitLineHighlight: {
                lineColor: 'green',
                lineWidth: 2
            }
        },
        grid: {
            verticalLine: {
                lineWidth: 1,
                lineColor: isDark.value ? '#202020' : '#e8e8e8',
              },
              backgroundColor: getCSSVariable('--vxe-ui-layout-background-color'),
              weekendBackgroundColor: 'rgba(0,0,0,0.05)',
              // 横向线条
              horizontalLine: {
                lineWidth: 1,
                lineColor: isDark.value ? '#2c2c2c' : '#e0e0e0',
              },
        },
        headerRowHeight: 40,
        rowHeight: 40,
        taskBar: {
            startDateField: 'end',
            endDateField: 'end',
            hoverBarStyle: {
                barOverlayColor: 'transparent',
            },
            labelTextStyle: {
                fontFamily: 'Arial',
                fontSize: 12,
                textAlign: 'left',
                textOverflow: 'ellipsis'
            },
            resizable: false,
            moveable: (args: { taskRecord: any; index: number; startDate: Date; endDate: Date; ganttInstance: Gantt }) => {
                return false
             },

            customLayout: (args:any) => {
                const { width, height, index,taskRecord, startDate, endDate, taskDays, progress, ganttInstance } = args;
                const container = new VRender.Group({
                    height,
                    width: width,
                    display: 'flex',
                    cornerRadius: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    fill: statusMappingColor[taskRecord.status as keyof typeof statusMappingColor]||'#ee8800'
                });
                const developer = new VRender.Text({
                  text: taskRecord.estimateHours+'h',
                  fontSize: 11,
                  fontFamily: 'sans-serif',
                  fill: '#fff',
                  fontWeight: 'bold',

                  maxLineWidth: width,
                  boundsPadding: [0, 0, 0, 0]
                });
                container.add(developer);
                return {
                  rootContainer: container
                };
              },
        },
        timelineHeader: {
            colWidth: 35,
            
            backgroundColor: token.value.colorBgContainer,
            horizontalLine: {
                lineWidth: 1,
                lineColor: getCSSVariable('--vxe-ui-table-border-color')
            },
            verticalLine: {
                lineWidth: 1,
                lineColor: getCSSVariable('--vxe-ui-table-border-color')
            },
            scales: [
                {
                    unit: 'day',
                    step: 1,
                    format(date) {
                        return date.dateIndex.toString();
                    },
                    customLayout: (args) => {
                        const { width, height, title, index, startDate, ganttInstance } = args
                        const wrapper = new VRender.Group({ width, height })
                        const container = new VRender.Group({
                            width,
                            height,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'nowrap',
                        })

                        wrapper.add(container)

                        const personInChargeContainer = new VRender.Group({
                            height: height - 6,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boundsPadding: [0, 0, 0, 0],
                            cornerRadius: 3,
                        })
                        const isSame = dayjs(startDate).isSame(dayjs(), 'day')
                        const isMounthStart = dayjs(startDate).date() === 1
                        const month = dayjs(startDate).get('month') + 1
                        const personInCharge = new VRender.Text({
                            text: isMounthStart ? month + '月' : isSame ? '今天' : title,
                            fontSize: 12,
                            fill: isSame||isMounthStart ? 'red' : '#1677ff',
                            fontWeight: 'bold',
                            whiteSpace: 'no-wrap',
                            maxLineWidth: width,
                            boundsPadding: [0, 0, 0, 10]
                        })
                        personInChargeContainer.add(personInCharge)
                        container.add(personInChargeContainer)
                        return {
                            rootContainer: wrapper,
                        }
                    },
                }
            ]
        },
        minDate: dayjs().subtract(1, 'month'),
        maxDate: dayjs().add(1, 'month'),
        markLine: [
            {
                date: dayjs().format('YYYY-MM-DD'),
                position: 'middle',
                style: {
                    lineWidth: 1,
                    lineColor: token.value.colorPrimary,
                    lineDash: [8, 4],
                },
            },
        ],
    }
}
