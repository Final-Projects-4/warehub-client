import React from "react";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";
import { Flex } from "@chakra-ui/react";

const data = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  datasets: [
    {
      label: "My Balance",
      fill: false,
      lineTension: 0.5,
      backgroundColor: "#db86b2",
      borderColor: "#B57295",
      borderCapStyle: "butt",
      borderDashOffset: 0.0,
      borderJoinStyle: "#B57295",
      pointBorderColor: "#B57295",
      pointBackgroundColor: "#fff",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "#B57295",
      pointHoverBorderColor: "#B57295",
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: [100, 150, 200, 350, 400, 550, 600, 650, 500, 550, 600],
    },
  ],
};

const options = {
  maintainAspectRatio: true,
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        borderDash: [3, 3],
      },
      // beginAtZero: true, // this works
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};

const MyChart = () => {
  return (
    <Flex p="2%">
      <Line data={data} options={options} />
    </Flex>
  );
};

export default MyChart;