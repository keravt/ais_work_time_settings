
export function convertDateToICalFormat(date: Date) {
    const year = date.getUTCFullYear();
    const month = padZeroes(date.getUTCMonth() + 1); // Months are zero-based
    const day = padZeroes(date.getUTCDate());
    const hours = padZeroes(date.getUTCHours());
    const minutes = padZeroes(date.getUTCMinutes());
    const seconds = padZeroes(date.getUTCSeconds());
  
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }


  
  function padZeroes(number: number) {
    return number < 10 ? `0${number}` : `${number}`;
  }



  export function isDarkColor(color:string) {
    // Конвертируем HEX в RGB
    const rgb = {
        r: parseInt(color.substring(1, 3), 16),
        g: parseInt(color.substring(3, 5), 16),
        b: parseInt(color.substring(5, 7), 16)
    };

    // Вычисляем яркость по формуле W3C
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

    // Если яркость ниже порогового значения, считаем цвет темным
    return brightness < 150;
}

