import Select from 'react-select';
import { TOKEN_KIND } from '../../constants';
import { useGlobalContext } from '../../providers/GlobalProvider';

const SelectNet = ({ value, onChange, data }) => {
  
  const { darkMode } = useGlobalContext();

  // const data = [
  //   {
  //     value: 0,
  //     text: TOKEN_KIND[0].title,
  //   },
  //   {
  //     value: 1,
  //     text: TOKEN_KIND[1].title,
  //   }
  // ];

  return (
    <Select
      // placeholder="Network"
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          background: darkMode ? '#F5F5F5' : '#03122a',
          border: 'none',
          boxShadow: 'none',
          outline: 'none',
          borderRadius: '10px',
          padding: '8px 0'
        }),
        input: (baseStyles) => ({
          ...baseStyles,
          color: darkMode ? 'black' : 'white'
        }),
        singleValue: (baseStyles) => ({
          ...baseStyles,
          color: darkMode ? 'black' : 'white',
          marginLeft: '4px'
        }),
        indicatorContainer: base => ({
          ...base,
          color: darkMode ? 'black' : 'white'
        }),
        indicatorSeparator: base => ({
          ...base,
          display: 'none'
        }),
        menuList: (baseStyles) => ({
          ...baseStyles,
          background: darkMode? '#F5F5F5' : '#1c2532',
          color: darkMode ? 'black' : 'white'
        }),
        option: (baseStyles, { isSelected }) => ({
          ...baseStyles,
          background: darkMode ? (isSelected ? '#F5F5F5' : '#FFFFFF') : (isSelected ? '#2c323a' : '#1c2532'),
          color: darkMode ? 'black' : 'white',
          ':hover': {
            background: darkMode? '#F5F5F5' : '#2c323a',
            backgroundColor: darkMode? '#F5F5F5' : '#2c323a'
          }
        }),
      }}
      value={data[value]}
      options={data}
      onChange={onChange}
      getOptionLabel={e => (
        <div className="flex items-center">
          {e.icon}
          <span className='source-1 ml-2'>{e.text}</span>
        </div>
      )}
    />
  )
}

export default SelectNet;