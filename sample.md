# Зарим тэмдэглэгээний жишээ  

![зураг|25%](images.jpeg)

**Тод**  
_Налуу_   
~Дундуур зураас~  

## Хялбар томъёо

$ \sqrt{n} $, $ O(n \log n) $, $ n \le 10^5 $

## Дэлгэрэнгүй томъёо
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

## Жагсаалт

- Зүйл нэг
- Зүйл хоёр
- Дэд зүйл  

# Хүснэгт

| Дэд бодлого | Хязгаарлалт | Оноо |
| :-----: | ----------- | :----: |
| 1       | $n \le 3$   | 5      |
| 2       | $n \le 15$  | 10     |
| 3       | $n \le \sqrt{n}$ | 20 |
| 4       | Нэмэлт хязгаарлалт байхгүй | 65 |

## Жишээ

Оролт
```
3
1 2 3
```
Гаралт
```
6
```

## Зураг

![жишээ|200|right](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDQwIDMwMCI+PHJlY3Qgd2lkdGg9IjQ0MCIgaGVpZ2h0PSIzMDAiIHJ4PSIyMCIgZmlsbD0iIzE2Mjg1YSIvPjxyZWN0IHg9IjUwIiB5PSIxNzAiIHdpZHRoPSI1MiIgaGVpZ2h0PSI5MCIgcng9IjciIGZpbGw9IiMyZjViZWEiLz48cmVjdCB4PSIxMjIiIHk9IjEyNSIgd2lkdGg9IjUyIiBoZWlnaHQ9IjEzNSIgcng9IjciIGZpbGw9IiM3YjVjZjAiLz48cmVjdCB4PSIxOTQiIHk9Ijg1IiB3aWR0aD0iNTIiIGhlaWdodD0iMTc1IiByeD0iNyIgZmlsbD0iIzBmOWQ4YSIvPjxyZWN0IHg9IjI2NiIgeT0iMTQwIiB3aWR0aD0iNTIiIGhlaWdodD0iMTIwIiByeD0iNyIgZmlsbD0iI2Q4Mzg2YiIvPjxyZWN0IHg9IjMzOCIgeT0iNTUiIHdpZHRoPSI1MiIgaGVpZ2h0PSIyMDUiIHJ4PSI3IiBmaWxsPSIjZTM5MzFiIi8+PHJlY3QgeD0iNDAiIHk9IjI2MiIgd2lkdGg9IjM2MCIgaGVpZ2h0PSI0IiByeD0iMiIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iLjUiLz48L3N2Zz4=)
Харах цонхонд зураг дээр товшоод өргөн, өндөр, байрлалыг шууд тохируулж болно. 


## Програмын код

```cpp
//C++
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << n * (n + 1) / 2 << endl;
}
```

```csharp
//C#
using System;
class Program
{
    // 1-ээс n хүртэлх тооны нийлбэр
    static void Main()
    {
        long n = long.Parse(Console.ReadLine());
        Console.WriteLine(n * (n + 1) / 2);
    }
}
```

## Холбоос   хийх

[Холбогдох] <a href="https://mail.google.com/mail/?view=cm&fs=1&to=dashdemberel@msue.edu.mn&su= Баярлааа" target="_blank">dashdemberel@msue.edu.mn</a>

[Холбоос] <a href="https://informatics.edu.mn/onlinejudge/" target="_blank">informatics.edu.mn</a>

> Иш татсан текст энд байна.
