import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const AssetDetailsPage = () => {
  const { invoice_id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(
        `http://192.168.56.1:80/invoices/${invoice_id}`
      );
      if (!response.ok) {
        throw new Error("Error fetching invoice");
      }
      const data = await response.json();
      console.log(data);
      setInvoice(data);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      // Handle the error, display an error message, or perform any other necessary actions
    }
  };

  if (!invoice) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Invoice Details</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-gray-300 rounded-lg">
          <h2 className="mb-2 text-lg font-semibold">Department</h2>
          <p className="text-gray-600">{invoice.Department}</p>
        </div>
        <div className="p-4 border border-gray-300 rounded-lg">
          <h2 className="mb-2 text-lg font-semibold">Invoice Receipt Date</h2>
          <p className="text-gray-600">{invoice["Invoice Receipt Date"]}</p>
        </div>
        <div className="p-4 border border-gray-300 rounded-lg">
          <h2 className="mb-2 text-lg font-semibold">Invoice Receipt Number</h2>
          <p className="text-gray-600">{invoice["Invoice Receipt Number"]}</p>
        </div>
        <div className="p-4 border border-gray-300 rounded-lg">
          <h2 className="mb-2 text-lg font-semibold">Total</h2>
          <p className="text-gray-600">{invoice.Total}</p>
        </div>
        <div className="p-4 border border-gray-300 rounded-lg">
          <h2 className="mb-2 text-lg font-semibold">Vendor Address</h2>
          <p className="text-gray-600">{invoice["VENDOR ADDRESS"]}</p>
        </div>
        <div className="p-4 border border-gray-300 rounded-lg">
          <h2 className="mb-2 text-lg font-semibold">Vendor Name</h2>
          <p className="text-gray-600">{invoice["VENDOR NAME"]}</p>
        </div>
        {invoice.items.map((item, index) => (
          <div key={index} className="p-4 border border-gray-300 rounded-lg">
            <h2 className="mb-2 text-lg font-semibold">Item {index + 1}</h2>
            <p className="text-gray-600">{item.items}</p>
            <p className="text-gray-600">Quantity: {item.quantity}</p>
            <p className="text-gray-600">Unit Price: {item.unit_price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetDetailsPage;
