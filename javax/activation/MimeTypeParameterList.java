package javax.activation;

import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Locale;

public class MimeTypeParameterList
{
  private static final String TSPECIALS = "()<>@,;:/[]?=\\\"";
  private Hashtable parameters = new Hashtable();

  public MimeTypeParameterList()
  {
  }

  public MimeTypeParameterList(String paramString)
    throws MimeTypeParseException
  {
    parse(paramString);
  }

  private static boolean isTokenChar(char paramChar)
  {
    return (paramChar > ' ') && (paramChar < '') && ("()<>@,;:/[]?=\\\"".indexOf(paramChar) < 0);
  }

  private static String quote(String paramString)
  {
    int i = 0;
    int j = paramString.length();
    int k = 0;
    StringBuffer localStringBuffer;
    if ((k >= j) || (i != 0))
      if (i != 0)
      {
        localStringBuffer = new StringBuffer();
        localStringBuffer.ensureCapacity((int)(1.5D * j));
        localStringBuffer.append('"');
      }
    for (int m = 0; ; m++)
    {
      if (m >= j)
      {
        localStringBuffer.append('"');
        paramString = localStringBuffer.toString();
        return paramString;
        if (isTokenChar(paramString.charAt(k)));
        for (i = 0; ; i = 1)
        {
          k++;
          break;
        }
      }
      char c = paramString.charAt(m);
      if ((c == '\\') || (c == '"'))
        localStringBuffer.append('\\');
      localStringBuffer.append(c);
    }
  }

  private static int skipWhiteSpace(String paramString, int paramInt)
  {
    int i = paramString.length();
    while (true)
    {
      if ((paramInt >= i) || (!Character.isWhitespace(paramString.charAt(paramInt))))
        return paramInt;
      paramInt++;
    }
  }

  private static String unquote(String paramString)
  {
    int i = paramString.length();
    StringBuffer localStringBuffer = new StringBuffer();
    localStringBuffer.ensureCapacity(i);
    int j = 0;
    int k = 0;
    if (k >= i)
      return localStringBuffer.toString();
    char c = paramString.charAt(k);
    if ((j == 0) && (c != '\\'))
      localStringBuffer.append(c);
    while (true)
    {
      k++;
      break;
      if (j != 0)
      {
        localStringBuffer.append(c);
        j = 0;
      }
      else
      {
        j = 1;
      }
    }
  }

  public String get(String paramString)
  {
    return (String)this.parameters.get(paramString.trim().toLowerCase(Locale.ENGLISH));
  }

  public Enumeration getNames()
  {
    return this.parameters.keys();
  }

  public boolean isEmpty()
  {
    return this.parameters.isEmpty();
  }

  protected void parse(String paramString)
    throws MimeTypeParseException
  {
    if (paramString == null);
    int i;
    do
    {
      return;
      i = paramString.length();
    }
    while (i <= 0);
    int i1;
    char c;
    String str2;
    for (int j = skipWhiteSpace(paramString, 0); ; j = skipWhiteSpace(paramString, i1))
    {
      if ((j >= i) || (paramString.charAt(j) != ';'))
      {
        if (j >= i)
          break;
        throw new MimeTypeParseException("More characters encountered in input than expected.");
      }
      int k = skipWhiteSpace(paramString, j + 1);
      if (k >= i)
        break;
      int m = k;
      String str1;
      int n;
      while (true)
      {
        if ((k >= i) || (!isTokenChar(paramString.charAt(k))))
        {
          str1 = paramString.substring(m, k).toLowerCase(Locale.ENGLISH);
          n = skipWhiteSpace(paramString, k);
          if ((n < i) && (paramString.charAt(n) == '='))
            break;
          throw new MimeTypeParseException("Couldn't find the '=' that separates a parameter name from its value.");
        }
        k++;
      }
      i1 = skipWhiteSpace(paramString, n + 1);
      if (i1 >= i)
        throw new MimeTypeParseException("Couldn't find a value for parameter named " + str1);
      c = paramString.charAt(i1);
      if (c != '"')
        break label321;
      int i3 = i1 + 1;
      if (i3 >= i)
        throw new MimeTypeParseException("Encountered unterminated quoted parameter value.");
      int i4 = i3;
      while (true)
      {
        if (i3 >= i);
        do
        {
          if (c == '"')
            break;
          throw new MimeTypeParseException("Encountered unterminated quoted parameter value.");
          c = paramString.charAt(i3);
        }
        while (c == '"');
        if (c == '\\')
          i3++;
        i3++;
      }
      str2 = unquote(paramString.substring(i4, i3));
      i1 = i3 + 1;
      this.parameters.put(str1, str2);
    }
    label321: if (isTokenChar(c))
    {
      int i2 = i1;
      while (true)
      {
        if ((i1 >= i) || (!isTokenChar(paramString.charAt(i1))))
        {
          str2 = paramString.substring(i2, i1);
          break;
        }
        i1++;
      }
    }
    throw new MimeTypeParseException("Unexpected character encountered at index " + i1);
  }

  public void remove(String paramString)
  {
    this.parameters.remove(paramString.trim().toLowerCase(Locale.ENGLISH));
  }

  public void set(String paramString1, String paramString2)
  {
    this.parameters.put(paramString1.trim().toLowerCase(Locale.ENGLISH), paramString2);
  }

  public int size()
  {
    return this.parameters.size();
  }

  public String toString()
  {
    StringBuffer localStringBuffer = new StringBuffer();
    localStringBuffer.ensureCapacity(16 * this.parameters.size());
    Enumeration localEnumeration = this.parameters.keys();
    while (true)
    {
      if (!localEnumeration.hasMoreElements())
        return localStringBuffer.toString();
      String str = (String)localEnumeration.nextElement();
      localStringBuffer.append("; ");
      localStringBuffer.append(str);
      localStringBuffer.append('=');
      localStringBuffer.append(quote((String)this.parameters.get(str)));
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.MimeTypeParameterList
 * JD-Core Version:    0.6.2
 */