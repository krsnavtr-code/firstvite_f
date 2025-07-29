import React from "react";

function Cards({ item }) {
  return (
    <>
      <div className="mt-4 my-3 p-3">
        <div className="card w-92 bg-base-100 shadow-xl hover:scale-105 duration-200 dark:bg-slate-900 dark:text-white dark:border">
          <figure>
            <img src={item.image} alt="Shoes" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">
              {item.name}
              <div className="badge badge-secondary">{item.category}</div>
            </h2>
            <p>{item.title}</p>
            <div className="card-actions justify-between items-center">
              <div className={`badge ${item.price === 0 ? 'badge-success' : 'badge-outline'}`}>
                {item.price === 0 ? 'Free' : `$${item.price}`}
              </div>
              <div className="cursor-pointer px-3 py-1 rounded-full border-[2px] hover:bg-pink-500 hover:text-white duration-200">
                {item.price === 0 ? 'Enroll Now' : 'Buy Now'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Cards;
