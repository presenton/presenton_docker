import React, { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetHeader,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, Trash, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StoreChartData } from '../utils/chartDataTransforms';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { renderChart } from './slide_config';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartSettings } from '@/store/slices/presentationGeneration';

interface ChartEditorProps {
    isOpen: boolean;
    onClose: () => void;
    chartData: StoreChartData;
    onChartDataChange: (newData: StoreChartData) => void;
    chartSettings: ChartSettings;
    setChartSettings: (newSettings: ChartSettings) => void;
}

const ChartEditor = ({ isOpen, onClose, chartData, onChartDataChange, chartSettings, setChartSettings }: ChartEditorProps) => {
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const { currentColors } = useSelector((state: RootState) => state.theme);

    const handleCategoryChange = (index: number, value: string) => {
        const newData = {
            ...chartData,
            data: {
                ...chartData.data,
                categories: [
                    ...chartData.data.categories.slice(0, index),
                    value,
                    ...chartData.data.categories.slice(index + 1)
                ]
            }
        };
        onChartDataChange(newData);
    };


    const handleValueChange = (categoryIndex: number, seriesIndex: number, value: string) => {
        const newData = {
            ...chartData,
            data: {
                ...chartData.data,
                series: chartData.data.series.map((series, idx) => {
                    if (idx === seriesIndex) {
                        return {
                            ...series,
                            data: [...series.data.slice(0, categoryIndex), Number(value), ...series.data.slice(categoryIndex + 1)]
                        };
                    }
                    return series;
                })
            }
        };
        onChartDataChange(newData);
    };

    const addCategory = () => {

        const newData = {
            ...chartData,
            data: {
                ...chartData.data,
                categories: [...chartData.data.categories, ''],
                series: chartData.data.series.map(series => ({
                    ...series,
                    data: [...series.data, 0]
                }))
            }
        };
        onChartDataChange(newData);
    };

    const addSeriesBefore = (index: number) => {
        if (chartData.type === 'pie' && chartData.data.series.length >= 1) {
            return;
        } else {
            if (chartData.data.series.length >= 4) {
                return;
            }
        }
        const newData = {
            ...chartData,
            data: {
                ...chartData.data,
                series: [
                    ...chartData.data.series.slice(0, index),
                    {
                        name: `Series ${chartData.data.series.length + 1}`,
                        data: new Array(chartData.data.categories.length).fill(0)
                    },
                    ...chartData.data.series.slice(index)
                ]
            }
        };
        onChartDataChange(newData);
    };

    const addSeriesAfter = (index: number) => {
        if (chartData.type === 'pie' && chartData.data.series.length >= 1) {
            return;
        } else {
            if (chartData.data.series.length >= 4) {
                return;
            }
        }
        const newData = {
            ...chartData,
            data: {
                ...chartData.data,
                series: [
                    ...chartData.data.series.slice(0, index + 1),
                    {
                        name: `Series ${chartData.data.series.length + 1}`,
                        data: new Array(chartData.data.categories.length).fill(0)
                    },
                    ...chartData.data.series.slice(index + 1)
                ]
            }
        };
        onChartDataChange(newData);
    };

    const removeCategory = (index: number) => {
        const newData = {
            ...chartData,
            data: {
                ...chartData.data,
                categories: chartData.data.categories.filter((_, idx) => idx !== index),
                series: chartData.data.series.map(series => ({
                    ...series,
                    data: series.data.filter((_, idx) => idx !== index)
                }))
            }
        };
        onChartDataChange(newData);
    };

    const removeSeries = (index: number) => {
        const newData = {
            ...chartData,
            data: {
                ...chartData.data,
                series: chartData.data.series.filter((_, idx) => idx !== index)
            }
        };
        onChartDataChange(newData);
    };

    const getColumnLetter = (index: number) => {
        return String.fromCharCode(65 + index);
    };

    const isColumnSelected = (colIndex: number) => {
        return selectedCell?.col === colIndex;
    };

    const isRowSelected = (rowIndex: number) => {
        return selectedCell?.row === rowIndex;
    };

    const isCellSelected = (rowIndex: number, colIndex: number) => {
        return selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
    };
    const disableAddSeries = (chartType: string) => {
        if (chartType === 'pie') {
            return chartData.data.series.length >= 1;
        } else {
            return chartData.data.series.length >= 4;
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
                <SheetHeader className='mb-4'>
                    <SheetTitle>Chart Editor</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-2 items-start gap-8 h-full">
                    <div className="space-y-4">
                        {/* Spreadsheet Table */}
                        <div className="rounded-md border bg-white">
                            <div className=" overflow-hidden">
                                <table className="w-full border-collapse ">
                                    <thead className='w-full'>
                                        <tr>
                                            <th className={`w-12 border-b border-r p-2 sticky top-0 z-10 transition-colors duration-200
                                                ${selectedCell ? 'bg-[#f3f3f3]' : 'bg-[#f8f9fa]'}`}>
                                            </th>
                                            {/* First column for categories */}
                                            <th className={`border-b border-r p-2 sticky top-0 z-10 transition-colors duration-200
                                                ${isColumnSelected(0) ? 'bg-[#e8f0fe]' : 'bg-[#f8f9fa]'}`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[13px] text-gray-600">A</span>
                                                </div>
                                            </th>
                                            {/* Data columns for each series */}
                                            {chartData && chartData.data.series && chartData.data.series.map((_, index) => (
                                                <th key={index}
                                                    className={`border-b border-r p-2 sticky top-0 z-10 transition-colors duration-200
                                                    ${isColumnSelected(index + 1) ? 'bg-[#e8f0fe]' : 'bg-[#f8f9fa]'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[13px] text-gray-600">
                                                            {getColumnLetter(index + 1)}
                                                        </span>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                    <ChevronDown className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-[200px] space-y-2">
                                                                <DropdownMenuItem className='cursor-pointer hover:bg-gray-100' onClick={() => addSeriesBefore(index)} disabled={disableAddSeries(chartData.type)}>
                                                                    <Plus className="mr-2 h-4 w-4" />
                                                                    Add Column before
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className='cursor-pointer hover:bg-gray-100' onClick={() => addSeriesAfter(index)} disabled={disableAddSeries(chartData.type)}>
                                                                    <Plus className="mr-2 h-4 w-4" />
                                                                    Add Column after
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className='cursor-pointer hover:bg-gray-100' onClick={() => removeSeries(index)}>
                                                                    <Trash className="mr-2 h-4 w-4 text-red-500" />
                                                                    Delete Column
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="w-10 bg-[#f8f9fa] border-b p-2 sticky top-0 z-10">
                                                <Button
                                                    onClick={() => addSeriesAfter(chartData.data.series.length - 1)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    disabled={disableAddSeries(chartData.type)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </th>
                                        </tr>
                                        {/* New row for series names */}
                                        <tr>
                                            <td className="border-r p-2 bg-[#f8f9fa]"></td>
                                            <td className="border-r p-2 bg-[#f8f9fa]"></td>
                                            {chartData.data.series.map((series, index) => (
                                                <td key={index} className="border p-1 bg-[#f8f9fa]">
                                                    <Input
                                                        value={series.name}
                                                        onChange={(e) => {
                                                            const newSeries = chartData.data.series.map((s, i) =>
                                                                i === index ? { ...s, name: e.target.value } : s
                                                            );
                                                            onChartDataChange({
                                                                ...chartData,
                                                                data: {
                                                                    ...chartData.data,
                                                                    series: newSeries
                                                                }
                                                            });
                                                        }}
                                                        className="border-0 focus-visible:ring-0 focus:ring-0 h-7 text-[13px] bg-transparent"
                                                    />
                                                </td>
                                            ))}
                                            <td className="w-10 bg-[#f8f9fa]"></td>
                                        </tr>
                                    </thead>

                                    <tbody className='block h-full max-h-[500px] custom_scrollbar  overflow-y-auto'>
                                        {chartData.data.categories.map((category, rowIndex) => (
                                            <tr key={rowIndex} className="group">
                                                {/* Row Numbers */}
                                                <td className={`border-r p-2 text-[13px] text-gray-600 w-12 text-center transition-colors duration-200
                                                    ${isRowSelected(rowIndex) ? 'bg-[#e8f0fe]' : 'bg-[#f8f9fa]'}`}>
                                                    {rowIndex + 1}
                                                </td>

                                                {/* Category Cell */}
                                                <td
                                                    className={`border p-1 relative transition-all duration-200
                                                        ${isCellSelected(rowIndex, 0)
                                                            ? 'bg-[#e8f0fe] outline outline-2 outline-blue-500 z-10'
                                                            : 'hover:bg-[#f1f3f4]'}`}
                                                    onClick={() => setSelectedCell({ row: rowIndex, col: 0 })}
                                                >
                                                    <Input
                                                        value={category}
                                                        onChange={(e) => handleCategoryChange(rowIndex, e.target.value)}
                                                        className="border-0 focus-visible:ring-0 focus:ring-0 h-7 text-[13px] bg-transparent"
                                                    />
                                                </td>


                                                {/* Series Data Cells */}
                                                {/* series name */}
                                                {chartData.data.series.map((series, seriesIndex) => (
                                                    <td
                                                        key={seriesIndex}
                                                        className={`border p-1 relative transition-all duration-200
                                                            ${isCellSelected(rowIndex, seriesIndex + 1)
                                                                ? 'bg-[#e8f0fe] outline outline-2 outline-blue-500 z-10'
                                                                : 'hover:bg-[#f1f3f4]'}`}
                                                        onClick={() => setSelectedCell({ row: rowIndex, col: seriesIndex + 1 })}
                                                    >
                                                        <Input
                                                            type="number"
                                                            value={series.data[rowIndex]}
                                                            onChange={(e) => handleValueChange(rowIndex, seriesIndex, e.target.value)}
                                                            className="border-0 focus-visible:ring-0 focus:ring-0 h-7 text-[13px] bg-transparent text-right"
                                                        />
                                                    </td>
                                                ))}

                                                <td className="w-10 p-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeCategory(rowIndex)}
                                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Add Row Button */}
                                <div className="p-2 border-t">
                                    <Button
                                        onClick={addCategory}
                                        variant="ghost"
                                        size="sm"
                                        className="w-full h-7 text-[13px] hover:bg-[#f8f9fa]"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add row
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add the chart preview section */}
                    <div className="border rounded-lg p-4 bg-white">
                        <h3 className="text-lg font-semibold mb-4">Preview</h3>
                        <div className="w-full" style={{ backgroundColor: currentColors.slideBg }}>
                            {renderChart(chartData, false, currentColors, chartSettings)}
                        </div>

                        {/* Add chart type selection */}
                        <div className="mt-4 border-t pt-4 custom_scrollbar">
                            <h4 className="text-sm font-medium mb-2">Chart Type</h4>
                            <div className="flex gap-2">
                                <Button
                                    variant={chartData.type === 'bar' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        const newData = { ...chartData, type: 'bar' as 'bar' };
                                        onChartDataChange(newData);
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    Bar
                                </Button>
                                <Button
                                    variant={chartData.type === 'line' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        const newData = { ...chartData, type: 'line' as 'line' };
                                        onChartDataChange(newData);
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <LineChartIcon className="h-4 w-4" />
                                    Line
                                </Button>
                                <Button
                                    variant={chartData.type === 'pie' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        const newData = { ...chartData, type: 'pie' as 'pie' };
                                        onChartDataChange(newData);
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <PieChartIcon className="h-4 w-4" />
                                    Pie
                                </Button>
                            </div>
                            <div className="border-t mt-6 pt-4 mb-6 flex flex-col items-start gap-4">
                                {chartData.type !== 'line' && (
                                    <div className="space-y-4">
                                        <div className="flex w-[350px] items-center justify-between p-3 bg-gray-100 rounded-lg">
                                            <Label htmlFor="data-label" className="font-medium">Data Label</Label>
                                            <Switch
                                                id="data-label"
                                                checked={chartSettings.showDataLabel}
                                                onCheckedChange={(checked) => setChartSettings({ ...chartSettings, showDataLabel: checked })}
                                            />
                                        </div>

                                        {chartSettings.showDataLabel && (
                                            <div className="space-y-4 p-4 max-w-[350px] bg-gray-50 rounded-lg">
                                                <Label className="font-medium block mb-2">Data Label Position</Label>
                                                <Tabs className="w-full" defaultValue={chartSettings.dataLabel.dataLabelPosition.toLowerCase()}>
                                                    <TabsList className="w-full grid grid-cols-2 mb-4">
                                                        <TabsTrigger onClick={() => setChartSettings({
                                                            ...chartSettings, dataLabel: {
                                                                ...chartSettings.dataLabel,
                                                                dataLabelPosition: 'Inside'
                                                            }
                                                        })} value="inside">Inside</TabsTrigger>
                                                        <TabsTrigger onClick={() => setChartSettings({
                                                            ...chartSettings, dataLabel: {
                                                                ...chartSettings.dataLabel,
                                                                dataLabelPosition: 'Outside'
                                                            }
                                                        })} value="outside">Outside</TabsTrigger>
                                                    </TabsList>
                                                    {chartData.type === 'bar' && <TabsContent value="inside">
                                                        <Label className="font-medium block mb-2">Data Label Alignment</Label>
                                                        <Tabs className="w-full" defaultValue={chartSettings.dataLabel.dataLabelAlignment.toLowerCase()}>
                                                            <TabsList className="w-full grid grid-cols-3">
                                                                <TabsTrigger onClick={() => setChartSettings({
                                                                    ...chartSettings, dataLabel: {
                                                                        ...chartSettings.dataLabel,
                                                                        dataLabelAlignment: 'Base'
                                                                    }
                                                                })} value="base">Base</TabsTrigger>
                                                                <TabsTrigger onClick={() => setChartSettings({
                                                                    ...chartSettings, dataLabel: {
                                                                        ...chartSettings.dataLabel,
                                                                        dataLabelAlignment: 'Center'
                                                                    }
                                                                })} value="center">Center</TabsTrigger>
                                                                <TabsTrigger onClick={() => setChartSettings({
                                                                    ...chartSettings, dataLabel: {
                                                                        ...chartSettings.dataLabel,
                                                                        dataLabelAlignment: 'End'
                                                                    }
                                                                })} value="end">End</TabsTrigger>
                                                            </TabsList>
                                                        </Tabs>
                                                    </TabsContent>}
                                                </Tabs>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="flex w-[350px] items-center justify-between p-3 bg-gray-100 rounded-lg">
                                    <Label htmlFor="legend" className="font-medium">Legend</Label>
                                    <Switch
                                        id="legend"
                                        checked={chartSettings.showLegend}
                                        onCheckedChange={(checked) => setChartSettings({ ...chartSettings, showLegend: checked })}
                                    />
                                </div>

                                {chartData.type !== 'pie' && <div className="flex w-[350px] items-center justify-between p-3 bg-gray-100 rounded-lg">
                                    <Label htmlFor="grid" className="font-medium">Grid Lines</Label>
                                    <Switch
                                        id="grid"
                                        checked={chartSettings.showGrid}
                                        onCheckedChange={(checked) => setChartSettings({ ...chartSettings, showGrid: checked })}
                                    />
                                </div>}

                                {chartData.type !== 'pie' && <div className="flex w-[350px] items-center justify-between p-3 bg-gray-100 rounded-lg">
                                    <Label htmlFor="axis-labels" className="font-medium">Axis Labels</Label>
                                    <Switch
                                        id="axis-labels"
                                        checked={chartSettings.showAxisLabel}
                                        onCheckedChange={(checked) => setChartSettings({ ...chartSettings, showAxisLabel: checked })}
                                    />
                                </div>}
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default ChartEditor; 