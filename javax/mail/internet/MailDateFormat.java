package javax.mail.internet;

import java.io.PrintStream;
import java.text.FieldPosition;
import java.text.NumberFormat;
import java.text.ParseException;
import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Locale;
import java.util.TimeZone;

public class MailDateFormat extends SimpleDateFormat
{
  private static Calendar cal = new GregorianCalendar(tz);
  static boolean debug = false;
  private static final long serialVersionUID = -8148227605210628779L;
  private static TimeZone tz = TimeZone.getTimeZone("GMT");

  public MailDateFormat()
  {
    super("EEE, d MMM yyyy HH:mm:ss 'XXXXX' (z)", Locale.US);
  }

  private static Date ourUTC(int paramInt1, int paramInt2, int paramInt3, int paramInt4, int paramInt5, int paramInt6, int paramInt7, boolean paramBoolean)
  {
    try
    {
      cal.clear();
      cal.setLenient(paramBoolean);
      cal.set(1, paramInt1);
      cal.set(2, paramInt2);
      cal.set(5, paramInt3);
      cal.set(11, paramInt4);
      cal.set(12, paramInt5 + paramInt7);
      cal.set(13, paramInt6);
      Date localDate = cal.getTime();
      return localDate;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  private static Date parseDate(char[] paramArrayOfChar, ParsePosition paramParsePosition, boolean paramBoolean)
  {
    while (true)
    {
      int k;
      try
      {
        MailDateParser localMailDateParser = new MailDateParser(paramArrayOfChar);
        localMailDateParser.skipUntilNumber();
        int i = localMailDateParser.parseNumber();
        if (!localMailDateParser.skipIfChar('-'))
          localMailDateParser.skipWhiteSpace();
        int j = localMailDateParser.parseMonth();
        if (!localMailDateParser.skipIfChar('-'))
          localMailDateParser.skipWhiteSpace();
        k = localMailDateParser.parseNumber();
        if (k < 50)
        {
          k += 2000;
          localMailDateParser.skipWhiteSpace();
          int m = localMailDateParser.parseNumber();
          localMailDateParser.skipChar(':');
          int n = localMailDateParser.parseNumber();
          boolean bool1 = localMailDateParser.skipIfChar(':');
          int i1 = 0;
          if (bool1)
          {
            int i2 = localMailDateParser.parseNumber();
            i1 = i2;
          }
          try
          {
            localMailDateParser.skipWhiteSpace();
            int i4 = localMailDateParser.parseTimeZone();
            i3 = i4;
            paramParsePosition.setIndex(localMailDateParser.getIndex());
            return ourUTC(k, j, i, m, n, i1, i3, paramBoolean);
          }
          catch (ParseException localParseException)
          {
            boolean bool2 = debug;
            int i3 = 0;
            if (!bool2)
              continue;
            System.out.println("No timezone? : '" + new String(paramArrayOfChar) + "'");
            i3 = 0;
            continue;
          }
        }
      }
      catch (Exception localException)
      {
        if (debug)
        {
          System.out.println("Bad date: '" + new String(paramArrayOfChar) + "'");
          localException.printStackTrace();
        }
        paramParsePosition.setIndex(1);
        return null;
      }
      if (k < 100)
        k += 1900;
    }
  }

  public StringBuffer format(Date paramDate, StringBuffer paramStringBuffer, FieldPosition paramFieldPosition)
  {
    int i = paramStringBuffer.length();
    super.format(paramDate, paramStringBuffer, paramFieldPosition);
    int j = i + 25;
    int k;
    int i7;
    if (paramStringBuffer.charAt(j) == 'X')
    {
      this.calendar.clear();
      this.calendar.setTime(paramDate);
      k = this.calendar.get(15) + this.calendar.get(16);
      if (k >= 0)
        break label216;
      i7 = j + 1;
      paramStringBuffer.setCharAt(j, '-');
      k = -k;
    }
    label216: int m;
    for (int n = i7; ; n = m)
    {
      int i1 = k / 60 / 1000;
      int i2 = i1 / 60;
      int i3 = i1 % 60;
      int i4 = n + 1;
      paramStringBuffer.setCharAt(n, Character.forDigit(i2 / 10, 10));
      int i5 = i4 + 1;
      paramStringBuffer.setCharAt(i4, Character.forDigit(i2 % 10, 10));
      int i6 = i5 + 1;
      paramStringBuffer.setCharAt(i5, Character.forDigit(i3 / 10, 10));
      (i6 + 1);
      paramStringBuffer.setCharAt(i6, Character.forDigit(i3 % 10, 10));
      return paramStringBuffer;
      j++;
      break;
      m = j + 1;
      paramStringBuffer.setCharAt(j, '+');
    }
  }

  public Date parse(String paramString, ParsePosition paramParsePosition)
  {
    return parseDate(paramString.toCharArray(), paramParsePosition, isLenient());
  }

  public void setCalendar(Calendar paramCalendar)
  {
    throw new RuntimeException("Method setCalendar() shouldn't be called");
  }

  public void setNumberFormat(NumberFormat paramNumberFormat)
  {
    throw new RuntimeException("Method setNumberFormat() shouldn't be called");
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.MailDateFormat
 * JD-Core Version:    0.6.2
 */