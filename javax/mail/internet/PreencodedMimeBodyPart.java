package javax.mail.internet;

import com.sun.mail.util.LineOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Enumeration;
import javax.activation.DataHandler;
import javax.mail.MessagingException;

public class PreencodedMimeBodyPart extends MimeBodyPart
{
  private String encoding;

  public PreencodedMimeBodyPart(String paramString)
  {
    this.encoding = paramString;
  }

  public String getEncoding()
    throws MessagingException
  {
    return this.encoding;
  }

  protected void updateHeaders()
    throws MessagingException
  {
    super.updateHeaders();
    MimeBodyPart.setEncoding(this, this.encoding);
  }

  public void writeTo(OutputStream paramOutputStream)
    throws IOException, MessagingException
  {
    LineOutputStream localLineOutputStream;
    Enumeration localEnumeration;
    if ((paramOutputStream instanceof LineOutputStream))
    {
      localLineOutputStream = (LineOutputStream)paramOutputStream;
      localEnumeration = getAllHeaderLines();
    }
    while (true)
    {
      if (!localEnumeration.hasMoreElements())
      {
        localLineOutputStream.writeln();
        getDataHandler().writeTo(paramOutputStream);
        paramOutputStream.flush();
        return;
        localLineOutputStream = new LineOutputStream(paramOutputStream);
        break;
      }
      localLineOutputStream.writeln((String)localEnumeration.nextElement());
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.PreencodedMimeBodyPart
 * JD-Core Version:    0.6.2
 */