function base36ToDecimal(str: string): number {
    return parseInt(str, 36);
  }
  
  function decimalToBase36(num: number): string {
    return num.toString(36);
  }
  
  function averageBase36(str1: string, str2: string): string {
    // Convert base-36 strings to decimal
    const num1 = base36ToDecimal(str1);
    const num2 = base36ToDecimal(str2);
  
    // Calculate average
    const avg = Math.ceil((num1 + num2) / 2);
  
    // Convert average back to base-36
    return decimalToBase36(avg);
}

console.log(averageBase36("z", "z"));