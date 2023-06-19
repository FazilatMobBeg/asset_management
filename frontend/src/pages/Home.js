import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactChart from "../components/ReactChart";

const Homepage = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);

  // total amount per month
  const chartData = [0, 0, 0, 1196, 2938, 999, 4180, 0, 0, 0, 0, 0];

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch("http://192.168.56.1:80/invoices");
      const data = await response.json();
      setAssets(data);
      // calculate total amount per month
      // update chartData
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  const handleAssetClick = (assetId) => {
    navigate(`/assets/${assetId}`);
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex justify-center mb-10 chart h-80">
        <ReactChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="p-4 bg-gray-200 rounded shadow cursor-pointer"
            onClick={() => handleAssetClick(asset.id)}
          >
            <h2 className="text-lg font-semibold">{asset.id}</h2>
            <div className="mt-4">
              <p className="text-gray-600">
                <span className="font-semibold">Department:</span>{" "}
                {asset.department}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Total:</span> {asset.total}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Invoice Receipt Date:</span>{" "}
                {asset.invoice_receipt_date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Homepage;
