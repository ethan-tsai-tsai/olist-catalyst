import { FC, useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
  [key: string]: number; // Allow other keys
}

interface ChartThreeState {
  series: number[];
}

interface SentimentDistributionPieChartProps {
  distribution: SentimentDistribution;
}

const SentimentDistributionPieChart: FC<SentimentDistributionPieChartProps> = ({ distribution }) => {
  const [state, setState] = useState<ChartThreeState>({
    series: [0, 0, 0],
  });

  useEffect(() => {
    if (distribution) {
      setState({
        series: [distribution.positive, distribution.neutral, distribution.negative],
      });
    }
  }, [distribution]);

  const options = {
    chart: {
      type: 'donut',
    },
    colors: ['#10B981', '#FBBF24', '#EF4444'], // Green (Positive), Yellow (Neutral), Red (Negative)
    labels: ['Positive', 'Neutral', 'Negative'],
    legend: {
      show: true,
      position: 'bottom',
      formatter: function(seriesName, opts) {
        return seriesName;
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          background: 'transparent',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return total.toLocaleString();
              }
            }
          }
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 380,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  return (
    <div className="sm:px-7.5 col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Sentiment Distribution
          </h5>
        </div>
      </div>

      <div className="mb-2">
        <div id="chartThree" className="mx-auto flex justify-center">
          <ReactApexChart
            options={options}
            series={state.series}
            type="donut"
          />
        </div>
      </div>


    </div>
  );
};

export default SentimentDistributionPieChart;
