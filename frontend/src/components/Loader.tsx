import { Puff } from 'react-loader-spinner';

const Loader = ({ size = "40" }) => {
  return (
    <Puff
      height={size}
      width={size}
      radius={1}
      color="#155dfc"
      ariaLabel="puff-loading"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
    />
  );
};

export default Loader;