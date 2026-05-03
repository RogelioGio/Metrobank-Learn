import React, { createContext, useState, useEffect, useContext } from "react";
import axiosClient from "MBLearn/src/axios-client";

const CategoriesFetchContext = createContext();

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCategories = (option = "all", courseStatus = "all") => {
    const endpoint = option === "shared"
        ? `/getSharedCategories/${courseStatus}`
        : `/getCategories/created`;

    setLoading(true);
    axiosClient
      .get(endpoint)
      .then(({ data }) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <CategoriesFetchContext.Provider
      value={{ categories, loading, setLoading, getCategories }}
    >
      {children}
    </CategoriesFetchContext.Provider>
  );
}

export const useCategories = () => useContext(CategoriesFetchContext);
