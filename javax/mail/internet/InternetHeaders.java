package javax.mail.internet;

import com.sun.mail.util.LineInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;
import javax.mail.Header;
import javax.mail.MessagingException;

public class InternetHeaders
{
  protected List headers = new ArrayList(40);

  public InternetHeaders()
  {
    this.headers.add(new InternetHeader("Return-Path", null));
    this.headers.add(new InternetHeader("Received", null));
    this.headers.add(new InternetHeader("Resent-Date", null));
    this.headers.add(new InternetHeader("Resent-From", null));
    this.headers.add(new InternetHeader("Resent-Sender", null));
    this.headers.add(new InternetHeader("Resent-To", null));
    this.headers.add(new InternetHeader("Resent-Cc", null));
    this.headers.add(new InternetHeader("Resent-Bcc", null));
    this.headers.add(new InternetHeader("Resent-Message-Id", null));
    this.headers.add(new InternetHeader("Date", null));
    this.headers.add(new InternetHeader("From", null));
    this.headers.add(new InternetHeader("Sender", null));
    this.headers.add(new InternetHeader("Reply-To", null));
    this.headers.add(new InternetHeader("To", null));
    this.headers.add(new InternetHeader("Cc", null));
    this.headers.add(new InternetHeader("Bcc", null));
    this.headers.add(new InternetHeader("Message-Id", null));
    this.headers.add(new InternetHeader("In-Reply-To", null));
    this.headers.add(new InternetHeader("References", null));
    this.headers.add(new InternetHeader("Subject", null));
    this.headers.add(new InternetHeader("Comments", null));
    this.headers.add(new InternetHeader("Keywords", null));
    this.headers.add(new InternetHeader("Errors-To", null));
    this.headers.add(new InternetHeader("MIME-Version", null));
    this.headers.add(new InternetHeader("Content-Type", null));
    this.headers.add(new InternetHeader("Content-Transfer-Encoding", null));
    this.headers.add(new InternetHeader("Content-MD5", null));
    this.headers.add(new InternetHeader(":", null));
    this.headers.add(new InternetHeader("Content-Length", null));
    this.headers.add(new InternetHeader("Status", null));
  }

  public InternetHeaders(InputStream paramInputStream)
    throws MessagingException
  {
    load(paramInputStream);
  }

  public void addHeader(String paramString1, String paramString2)
  {
    int i = this.headers.size();
    int j;
    if ((!paramString1.equalsIgnoreCase("Received")) && (!paramString1.equalsIgnoreCase("Return-Path")))
    {
      j = 0;
      if (j != 0)
        i = 0;
    }
    for (int k = -1 + this.headers.size(); ; k--)
    {
      if (k < 0)
      {
        this.headers.add(i, new InternetHeader(paramString1, paramString2));
        return;
        j = 1;
        break;
      }
      InternetHeader localInternetHeader = (InternetHeader)this.headers.get(k);
      if (paramString1.equalsIgnoreCase(localInternetHeader.getName()))
      {
        if (j == 0)
          break label140;
        i = k;
      }
      if (localInternetHeader.getName().equals(":"))
        i = k;
    }
    label140: this.headers.add(k + 1, new InternetHeader(paramString1, paramString2));
  }

  public void addHeaderLine(String paramString)
  {
    try
    {
      int i = paramString.charAt(0);
      if ((i == 32) || (i == 9))
      {
        InternetHeader localInternetHeader = (InternetHeader)this.headers.get(-1 + this.headers.size());
        localInternetHeader.line = (localInternetHeader.line + "\r\n" + paramString);
        return;
      }
      this.headers.add(new InternetHeader(paramString));
      return;
    }
    catch (StringIndexOutOfBoundsException localStringIndexOutOfBoundsException)
    {
    }
    catch (NoSuchElementException localNoSuchElementException)
    {
    }
  }

  public Enumeration getAllHeaderLines()
  {
    return getNonMatchingHeaderLines(null);
  }

  public Enumeration getAllHeaders()
  {
    return new matchEnum(this.headers, null, false, false);
  }

  public String getHeader(String paramString1, String paramString2)
  {
    String[] arrayOfString = getHeader(paramString1);
    if (arrayOfString == null)
      return null;
    if ((arrayOfString.length == 1) || (paramString2 == null))
      return arrayOfString[0];
    StringBuffer localStringBuffer = new StringBuffer(arrayOfString[0]);
    for (int i = 1; ; i++)
    {
      if (i >= arrayOfString.length)
        return localStringBuffer.toString();
      localStringBuffer.append(paramString2);
      localStringBuffer.append(arrayOfString[i]);
    }
  }

  public String[] getHeader(String paramString)
  {
    Iterator localIterator = this.headers.iterator();
    ArrayList localArrayList = new ArrayList();
    while (true)
    {
      if (!localIterator.hasNext())
      {
        if (localArrayList.size() != 0)
          break;
        return null;
      }
      InternetHeader localInternetHeader = (InternetHeader)localIterator.next();
      if ((paramString.equalsIgnoreCase(localInternetHeader.getName())) && (localInternetHeader.line != null))
        localArrayList.add(localInternetHeader.getValue());
    }
    return (String[])localArrayList.toArray(new String[localArrayList.size()]);
  }

  public Enumeration getMatchingHeaderLines(String[] paramArrayOfString)
  {
    return new matchEnum(this.headers, paramArrayOfString, true, true);
  }

  public Enumeration getMatchingHeaders(String[] paramArrayOfString)
  {
    return new matchEnum(this.headers, paramArrayOfString, true, false);
  }

  public Enumeration getNonMatchingHeaderLines(String[] paramArrayOfString)
  {
    return new matchEnum(this.headers, paramArrayOfString, false, true);
  }

  public Enumeration getNonMatchingHeaders(String[] paramArrayOfString)
  {
    return new matchEnum(this.headers, paramArrayOfString, false, false);
  }

  public void load(InputStream paramInputStream)
    throws MessagingException
  {
    LineInputStream localLineInputStream = new LineInputStream(paramInputStream);
    Object localObject = null;
    StringBuffer localStringBuffer = new StringBuffer();
    while (true)
    {
      String str;
      try
      {
        str = localLineInputStream.readLine();
        if ((str != null) && ((str.startsWith(" ")) || (str.startsWith("\t"))))
        {
          if (localObject != null)
          {
            localStringBuffer.append((String)localObject);
            localObject = null;
          }
          localStringBuffer.append("\r\n");
          localStringBuffer.append(str);
          if (str == null)
            break label146;
          if (str.length() > 0)
            continue;
          return;
        }
        if (localObject != null)
        {
          addHeaderLine((String)localObject);
        }
        else if (localStringBuffer.length() > 0)
        {
          addHeaderLine(localStringBuffer.toString());
          localStringBuffer.setLength(0);
        }
      }
      catch (IOException localIOException)
      {
        throw new MessagingException("Error in input stream", localIOException);
      }
      label146: return;
      localObject = str;
    }
  }

  public void removeHeader(String paramString)
  {
    for (int i = 0; ; i++)
    {
      if (i >= this.headers.size())
        return;
      InternetHeader localInternetHeader = (InternetHeader)this.headers.get(i);
      if (paramString.equalsIgnoreCase(localInternetHeader.getName()))
        localInternetHeader.line = null;
    }
  }

  public void setHeader(String paramString1, String paramString2)
  {
    int i = 0;
    int j = 0;
    if (j >= this.headers.size())
    {
      if (i == 0)
        addHeader(paramString1, paramString2);
      return;
    }
    InternetHeader localInternetHeader = (InternetHeader)this.headers.get(j);
    if (paramString1.equalsIgnoreCase(localInternetHeader.getName()))
    {
      if (i != 0)
        break label166;
      if (localInternetHeader.line == null)
        break label135;
      int k = localInternetHeader.line.indexOf(':');
      if (k < 0)
        break label135;
      localInternetHeader.line = (localInternetHeader.line.substring(0, k + 1) + " " + paramString2);
      label127: i = 1;
    }
    while (true)
    {
      j++;
      break;
      label135: localInternetHeader.line = (paramString1 + ": " + paramString2);
      break label127;
      label166: this.headers.remove(j);
      j--;
    }
  }

  protected static final class InternetHeader extends Header
  {
    String line;

    public InternetHeader(String paramString)
    {
      super("");
      int i = paramString.indexOf(':');
      if (i < 0);
      for (this.name = paramString.trim(); ; this.name = paramString.substring(0, i).trim())
      {
        this.line = paramString;
        return;
      }
    }

    public InternetHeader(String paramString1, String paramString2)
    {
      super("");
      if (paramString2 != null)
      {
        this.line = (paramString1 + ": " + paramString2);
        return;
      }
      this.line = null;
    }

    public String getValue()
    {
      int i = this.line.indexOf(':');
      if (i < 0)
        return this.line;
      for (int j = i + 1; ; j++)
      {
        if (j >= this.line.length());
        int k;
        do
        {
          return this.line.substring(j);
          k = this.line.charAt(j);
        }
        while ((k != 32) && (k != 9) && (k != 13) && (k != 10));
      }
    }
  }

  static class matchEnum
    implements Enumeration
  {
    private Iterator e;
    private boolean match;
    private String[] names;
    private InternetHeaders.InternetHeader next_header;
    private boolean want_line;

    matchEnum(List paramList, String[] paramArrayOfString, boolean paramBoolean1, boolean paramBoolean2)
    {
      this.e = paramList.iterator();
      this.names = paramArrayOfString;
      this.match = paramBoolean1;
      this.want_line = paramBoolean2;
      this.next_header = null;
    }

    private InternetHeaders.InternetHeader nextMatch()
    {
      InternetHeaders.InternetHeader localInternetHeader;
      if (!this.e.hasNext())
        localInternetHeader = null;
      do
      {
        return localInternetHeader;
        localInternetHeader = (InternetHeaders.InternetHeader)this.e.next();
        if (localInternetHeader.line == null)
          break;
        if (this.names != null)
          break label52;
      }
      while (!this.match);
      return null;
      label52: for (int i = 0; ; i++)
      {
        if (i >= this.names.length)
        {
          if (this.match)
            break;
          return localInternetHeader;
        }
        if (this.names[i].equalsIgnoreCase(localInternetHeader.getName()))
        {
          if (!this.match)
            break;
          return localInternetHeader;
        }
      }
    }

    public boolean hasMoreElements()
    {
      if (this.next_header == null)
        this.next_header = nextMatch();
      return this.next_header != null;
    }

    public Object nextElement()
    {
      if (this.next_header == null)
        this.next_header = nextMatch();
      if (this.next_header == null)
        throw new NoSuchElementException("No more headers");
      InternetHeaders.InternetHeader localInternetHeader = this.next_header;
      this.next_header = null;
      if (this.want_line)
        return localInternetHeader.line;
      return new Header(localInternetHeader.getName(), localInternetHeader.getValue());
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.InternetHeaders
 * JD-Core Version:    0.6.2
 */