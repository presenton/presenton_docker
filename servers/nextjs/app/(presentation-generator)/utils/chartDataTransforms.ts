// Store Chart Data Type
export interface StoreChartData {
    id: string;
    name: string;
    type: 'bar' | 'line' | 'pie';
    style: {
       
    };
    presentation: string;
    postfix: string;
    data: {
        categories: string[];
        series: Array<{
            name?: string;
            data: number[];
        }>;
    };
}
