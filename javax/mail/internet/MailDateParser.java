package javax.mail.internet;

import java.text.ParseException;

class MailDateParser
{
  int index = 0;
  char[] orig = null;

  public MailDateParser(char[] paramArrayOfChar)
  {
    this.orig = paramArrayOfChar;
  }

  int getIndex()
  {
    return this.index;
  }

  public int parseAlphaTimeZone()
    throws ParseException
  {
    int i = 0;
    try
    {
      char[] arrayOfChar1 = this.orig;
      int j = this.index;
      this.index = (j + 1);
      switch (arrayOfChar1[j])
      {
      default:
        throw new ParseException("Bad Alpha TimeZone", this.index);
      case 'U':
      case 'u':
      case 'G':
      case 'g':
      case 'E':
      case 'e':
      case 'C':
      case 'c':
      case 'M':
      case 'm':
      case 'P':
      case 'p':
      }
    }
    catch (ArrayIndexOutOfBoundsException localArrayIndexOutOfBoundsException)
    {
      throw new ParseException("Bad Alpha TimeZone", this.index);
    }
    char[] arrayOfChar7 = this.orig;
    int i9 = this.index;
    this.index = (i9 + 1);
    int i10 = arrayOfChar7[i9];
    int k;
    if ((i10 == 84) || (i10 == 116))
      k = 0;
    while (true)
      if (i != 0)
      {
        char[] arrayOfChar2 = this.orig;
        int m = this.index;
        this.index = (m + 1);
        int n = arrayOfChar2[m];
        if ((n == 83) || (n == 115))
        {
          char[] arrayOfChar3 = this.orig;
          int i1 = this.index;
          this.index = (i1 + 1);
          int i2 = arrayOfChar3[i1];
          if ((i2 != 84) && (i2 != 116))
          {
            throw new ParseException("Bad Alpha TimeZone", this.index);
            throw new ParseException("Bad Alpha TimeZone", this.index);
            char[] arrayOfChar5 = this.orig;
            int i5 = this.index;
            this.index = (i5 + 1);
            int i6 = arrayOfChar5[i5];
            if ((i6 == 77) || (i6 == 109))
            {
              char[] arrayOfChar6 = this.orig;
              int i7 = this.index;
              this.index = (i7 + 1);
              int i8 = arrayOfChar6[i7];
              if ((i8 == 84) || (i8 == 116))
                break label533;
            }
            throw new ParseException("Bad Alpha TimeZone", this.index);
            k = 300;
            i = 1;
            continue;
            k = 360;
            i = 1;
            continue;
            k = 420;
            i = 1;
            continue;
            k = 480;
            i = 1;
          }
        }
        else if ((n == 68) || (n == 100))
        {
          char[] arrayOfChar4 = this.orig;
          int i3 = this.index;
          this.index = (i3 + 1);
          int i4 = arrayOfChar4[i3];
          if ((i4 != 84) && (i4 == 116))
            break label519;
          k -= 60;
        }
      }
      else
      {
        return k;
        label519: throw new ParseException("Bad Alpha TimeZone", this.index);
        label533: i = 0;
        k = 0;
      }
  }

  public int parseMonth()
    throws ParseException
  {
    while (true)
    {
      int i30;
      int i23;
      int i15;
      try
      {
        char[] arrayOfChar1 = this.orig;
        int i = this.index;
        this.index = (i + 1);
        int j = arrayOfChar1[i];
        switch (j)
        {
        default:
          throw new ParseException("Bad Month", this.index);
        case 74:
        case 106:
          char[] arrayOfChar17 = this.orig;
          int i28 = this.index;
          this.index = (i28 + 1);
          switch (arrayOfChar17[i28])
          {
          case 'A':
          case 'a':
            char[] arrayOfChar19 = this.orig;
            int i31 = this.index;
            this.index = (i31 + 1);
            int i32 = arrayOfChar19[i31];
            if (i32 == 78)
              break label978;
            if (i32 != 110)
              continue;
            break;
          case 'U':
          case 'u':
            char[] arrayOfChar18 = this.orig;
            int i29 = this.index;
            this.index = (i29 + 1);
            i30 = arrayOfChar18[i29];
            if (i30 == 78)
              break label980;
            if (i30 != 110)
              break label982;
          }
          break;
        case 70:
        case 102:
          char[] arrayOfChar15 = this.orig;
          int i24 = this.index;
          this.index = (i24 + 1);
          int i25 = arrayOfChar15[i24];
          if ((i25 != 69) && (i25 != 101))
            continue;
          char[] arrayOfChar16 = this.orig;
          int i26 = this.index;
          this.index = (i26 + 1);
          int i27 = arrayOfChar16[i26];
          if (i27 == 66)
            break label999;
          if (i27 != 98)
            continue;
          break;
        case 77:
        case 109:
          char[] arrayOfChar13 = this.orig;
          int i20 = this.index;
          this.index = (i20 + 1);
          int i21 = arrayOfChar13[i20];
          if ((i21 != 65) && (i21 != 97))
            continue;
          char[] arrayOfChar14 = this.orig;
          int i22 = this.index;
          this.index = (i22 + 1);
          i23 = arrayOfChar14[i22];
          if (i23 == 82)
            break label1001;
          if (i23 != 114)
            break label1003;
          break;
        case 65:
        case 97:
          char[] arrayOfChar10 = this.orig;
          int i14 = this.index;
          this.index = (i14 + 1);
          i15 = arrayOfChar10[i14];
          if ((i15 != 80) && (i15 != 112))
            break label1021;
          char[] arrayOfChar11 = this.orig;
          int i16 = this.index;
          this.index = (i16 + 1);
          int i17 = arrayOfChar11[i16];
          if (i17 == 82)
            break label1019;
          if (i17 != 114)
            continue;
          break label1019;
          char[] arrayOfChar12 = this.orig;
          int i18 = this.index;
          this.index = (i18 + 1);
          int i19 = arrayOfChar12[i18];
          if (i19 == 71)
            break label1038;
          if (i19 != 103)
            continue;
          break;
        case 83:
        case 115:
          char[] arrayOfChar8 = this.orig;
          int i10 = this.index;
          this.index = (i10 + 1);
          int i11 = arrayOfChar8[i10];
          if ((i11 != 69) && (i11 != 101))
            continue;
          char[] arrayOfChar9 = this.orig;
          int i12 = this.index;
          this.index = (i12 + 1);
          int i13 = arrayOfChar9[i12];
          if (i13 == 80)
            break label1041;
          if (i13 != 112)
            continue;
          break;
        case 79:
        case 111:
          char[] arrayOfChar6 = this.orig;
          int i6 = this.index;
          this.index = (i6 + 1);
          int i7 = arrayOfChar6[i6];
          if ((i7 != 67) && (i7 != 99))
            continue;
          char[] arrayOfChar7 = this.orig;
          int i8 = this.index;
          this.index = (i8 + 1);
          int i9 = arrayOfChar7[i8];
          if (i9 == 84)
            break label1044;
          if (i9 != 116)
            continue;
          break;
        case 78:
        case 110:
          char[] arrayOfChar4 = this.orig;
          int i2 = this.index;
          this.index = (i2 + 1);
          int i3 = arrayOfChar4[i2];
          if ((i3 != 79) && (i3 != 111))
            continue;
          char[] arrayOfChar5 = this.orig;
          int i4 = this.index;
          this.index = (i4 + 1);
          int i5 = arrayOfChar5[i4];
          if (i5 == 86)
            break label1047;
          if (i5 != 118)
            continue;
          break;
        case 68:
        case 100:
        }
        char[] arrayOfChar2 = this.orig;
        int k = this.index;
        this.index = (k + 1);
        int m = arrayOfChar2[k];
        if ((m != 69) && (m != 101))
          continue;
        char[] arrayOfChar3 = this.orig;
        int n = this.index;
        this.index = (n + 1);
        int i1 = arrayOfChar3[n];
        if ((i1 != 67) && (i1 != 99))
          continue;
        return 11;
      }
      catch (ArrayIndexOutOfBoundsException localArrayIndexOutOfBoundsException)
      {
        continue;
        continue;
      }
      label978: return 0;
      label980: return 5;
      label982: if ((i30 == 76) || (i30 == 108))
      {
        return 6;
        label999: return 1;
        label1001: return 2;
        label1003: if ((i23 == 89) || (i23 == 121))
        {
          return 4;
          label1019: return 3;
          label1021: if (i15 != 85)
            if (i15 != 117);
        }
      }
    }
    label1038: return 7;
    label1041: return 8;
    label1044: return 9;
    label1047: return 10;
  }

  public int parseNumber()
    throws ParseException
  {
    int i = this.orig.length;
    int j = 0;
    int k = 0;
    if (this.index >= i)
    {
      if (j == 0);
    }
    else
    {
      do
      {
        return k;
        switch (this.orig[this.index])
        {
        default:
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        }
      }
      while (j != 0);
      throw new ParseException("No Number found", this.index);
      k *= 10;
      j = 1;
      while (true)
      {
        this.index = (1 + this.index);
        break;
        k = 1 + k * 10;
        j = 1;
        continue;
        k = 2 + k * 10;
        j = 1;
        continue;
        k = 3 + k * 10;
        j = 1;
        continue;
        k = 4 + k * 10;
        j = 1;
        continue;
        k = 5 + k * 10;
        j = 1;
        continue;
        k = 6 + k * 10;
        j = 1;
        continue;
        k = 7 + k * 10;
        j = 1;
        continue;
        k = 8 + k * 10;
        j = 1;
        continue;
        k = 9 + k * 10;
        j = 1;
      }
    }
    throw new ParseException("No Number found", this.index);
  }

  public int parseNumericTimeZone()
    throws ParseException
  {
    char[] arrayOfChar = this.orig;
    int i = this.index;
    this.index = (i + 1);
    int j = arrayOfChar[i];
    int k;
    if (j == 43)
      k = 1;
    do
    {
      int m = parseNumber();
      int n = 60 * (m / 100) + m % 100;
      if (k != 0)
        n = -n;
      return n;
      k = 0;
    }
    while (j == 45);
    throw new ParseException("Bad Numeric TimeZone", this.index);
  }

  public int parseTimeZone()
    throws ParseException
  {
    if (this.index >= this.orig.length)
      throw new ParseException("No more characters", this.index);
    int i = this.orig[this.index];
    if ((i == 43) || (i == 45))
      return parseNumericTimeZone();
    return parseAlphaTimeZone();
  }

  public int peekChar()
    throws ParseException
  {
    if (this.index < this.orig.length)
      return this.orig[this.index];
    throw new ParseException("No more characters", this.index);
  }

  public void skipChar(char paramChar)
    throws ParseException
  {
    if (this.index < this.orig.length)
    {
      if (this.orig[this.index] == paramChar)
      {
        this.index = (1 + this.index);
        return;
      }
      throw new ParseException("Wrong char", this.index);
    }
    throw new ParseException("No more characters", this.index);
  }

  public boolean skipIfChar(char paramChar)
    throws ParseException
  {
    if (this.index < this.orig.length)
    {
      if (this.orig[this.index] == paramChar)
      {
        this.index = (1 + this.index);
        return true;
      }
      return false;
    }
    throw new ParseException("No more characters", this.index);
  }

  public void skipUntilNumber()
    throws ParseException
  {
    try
    {
      while (true)
        switch (this.orig[this.index])
        {
        default:
          this.index = (1 + this.index);
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        }
    }
    catch (ArrayIndexOutOfBoundsException localArrayIndexOutOfBoundsException)
    {
      throw new ParseException("No Number Found", this.index);
    }
  }

  public void skipWhiteSpace()
  {
    int i = this.orig.length;
    while (true)
    {
      if (this.index >= i)
        return;
      switch (this.orig[this.index])
      {
      default:
        return;
      case '\t':
      case '\n':
      case '\r':
      case ' ':
      }
      this.index = (1 + this.index);
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.MailDateParser
 * JD-Core Version:    0.6.2
 */