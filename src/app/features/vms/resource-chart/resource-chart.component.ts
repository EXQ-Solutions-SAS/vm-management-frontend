// resource-chart.component.ts
import { Component, computed, input } from '@angular/core';
import { NgApexchartsModule, ApexChart, ApexStroke, ApexTheme, ApexPlotOptions } from "ng-apexcharts";

@Component({
  selector: 'app-resource-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  template: `
    <div class="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl shadow-sm h-full flex flex-col justify-center">
      <apx-chart
        [series]="chartOptions().series"
        [chart]="chartOptions().chart"
        [plotOptions]="chartOptions().plotOptions"
        [labels]="chartOptions().labels"
        [colors]="chartOptions().colors"
        [stroke]="chartOptions().stroke"
        [theme]="chartOptions().theme"
      ></apx-chart>
      <div class="text-center mt-2">
        <p class="text-zinc-500 text-xs uppercase tracking-widest font-semibold">Eficiencia de Recursos</p>
      </div>
    </div>
  `
})
export class ResourceChartComponent {
  // Recibimos los signals del padre como valores simples
  usedCores = input.required<number>();
  totalCores = input.required<number>();
  usedRam = input.required<number>();
  totalRam = input.required<number>();
  usedDisk = input.required<number>();
  totalDisk = input.required<number>();

  chartOptions = computed(() => {
    // Calculamos los porcentajes aquí mismo
    const pcpu = Math.round((this.usedCores() / (this.totalCores() || 1)) * 100);
    const pram = Math.round((this.usedRam() / (this.totalRam() || 1)) * 100);
    const pdisk = Math.round((this.usedDisk() / (this.totalDisk() || 1)) * 100);

    return {
      // IMPORTANTE: Devolvemos un nuevo array para que ApexCharts detecte el cambio
      series: [pcpu, pram, pdisk],
      chart: {
        height: 300,
        type: 'radialBar' as ApexChart['type'],
        animations: { enabled: true, easing: 'easeinout', speed: 800 }, // Aseguramos animación
        foreColor: "#a1a1aa"
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            total: {
              show: true,
              label: 'USO REAL',
              formatter: () => 'Activo'
            }
          },
          track: { background: "#27272a" }
        }
      } as ApexPlotOptions,
      labels: ["CPU", "RAM", "Disco"],
      colors: ["#3b82f6", "#10b981", "#a855f7"],
      stroke: { lineCap: "round" as ApexStroke['lineCap'] },
      theme: { mode: 'dark' as ApexTheme['mode'] }
    };
  });
}