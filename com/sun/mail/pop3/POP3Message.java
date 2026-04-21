package com.sun.mail.pop3;

import java.io.EOFException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Enumeration;
import javax.mail.Flags;
import javax.mail.Folder;
import javax.mail.FolderClosedException;
import javax.mail.IllegalWriteException;
import javax.mail.MessageRemovedException;
import javax.mail.MessagingException;
import javax.mail.internet.InternetHeaders;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.SharedInputStream;

public class POP3Message extends MimeMessage
{
  static final String UNKNOWN = "UNKNOWN";
  private POP3Folder folder;
  private int hdrSize = -1;
  private int msgSize = -1;
  String uid = "UNKNOWN";

  public POP3Message(Folder paramFolder, int paramInt)
    throws MessagingException
  {
    super(paramFolder, paramInt);
    this.folder = ((POP3Folder)paramFolder);
  }

  private void loadHeaders()
    throws MessagingException
  {
    try
    {
      try
      {
        if (this.headers != null)
          return;
        if (!((POP3Store)this.folder.getStore()).disableTop)
        {
          localInputStream = this.folder.getProtocol().top(this.msgnum, 0);
          if (localInputStream != null);
        }
        else
        {
          getContentStream().close();
          return;
        }
      }
      finally
      {
      }
    }
    catch (EOFException localEOFException)
    {
      while (true)
      {
        InputStream localInputStream;
        this.folder.close(false);
        throw new FolderClosedException(this.folder, localEOFException.toString());
        this.hdrSize = localInputStream.available();
        this.headers = new InternetHeaders(localInputStream);
      }
    }
    catch (IOException localIOException)
    {
      throw new MessagingException("error loading POP3 headers", localIOException);
    }
  }

  public void addHeader(String paramString1, String paramString2)
    throws MessagingException
  {
    throw new IllegalWriteException("POP3 messages are read-only");
  }

  public void addHeaderLine(String paramString)
    throws MessagingException
  {
    throw new IllegalWriteException("POP3 messages are read-only");
  }

  public Enumeration getAllHeaderLines()
    throws MessagingException
  {
    if (this.headers == null)
      loadHeaders();
    return this.headers.getAllHeaderLines();
  }

  public Enumeration getAllHeaders()
    throws MessagingException
  {
    if (this.headers == null)
      loadHeaders();
    return this.headers.getAllHeaders();
  }

  protected InputStream getContentStream()
    throws MessagingException
  {
    try
    {
      try
      {
        if (this.contentStream == null)
        {
          Protocol localProtocol = this.folder.getProtocol();
          int i = this.msgnum;
          if (this.msgSize > 0)
          {
            j = this.msgSize + this.hdrSize;
            localInputStream = localProtocol.retr(i, j);
            if (localInputStream != null)
              break label107;
            this.expunged = true;
            throw new MessageRemovedException();
          }
        }
      }
      finally
      {
      }
    }
    catch (EOFException localEOFException)
    {
      InputStream localInputStream;
      while (true)
      {
        this.folder.close(false);
        throw new FolderClosedException(this.folder, localEOFException.toString());
        int j = 0;
      }
      if ((this.headers == null) || (((POP3Store)this.folder.getStore()).forgetTopHeaders))
      {
        this.headers = new InternetHeaders(localInputStream);
        this.hdrSize = ((int)((SharedInputStream)localInputStream).getPosition());
        this.contentStream = ((SharedInputStream)localInputStream).newStream(this.hdrSize, -1L);
        return super.getContentStream();
      }
      label187: int k = 0;
      label190: int m = localInputStream.read();
      if (m < 0)
        label202: if (localInputStream.available() != 0)
          break label280;
      while (true)
      {
        this.hdrSize = ((int)((SharedInputStream)localInputStream).getPosition());
        break;
        if (m == 10)
          break label202;
        if (m == 13)
        {
          if (localInputStream.available() <= 0)
            break label202;
          localInputStream.mark(1);
          if (localInputStream.read() == 10)
            break label202;
          localInputStream.reset();
          break label202;
        }
        k++;
        break label190;
        label280: if (k != 0)
          break label187;
      }
    }
    catch (IOException localIOException)
    {
      label107: throw new MessagingException("error fetching POP3 content", localIOException);
    }
  }

  public String getHeader(String paramString1, String paramString2)
    throws MessagingException
  {
    if (this.headers == null)
      loadHeaders();
    return this.headers.getHeader(paramString1, paramString2);
  }

  public String[] getHeader(String paramString)
    throws MessagingException
  {
    if (this.headers == null)
      loadHeaders();
    return this.headers.getHeader(paramString);
  }

  public Enumeration getMatchingHeaderLines(String[] paramArrayOfString)
    throws MessagingException
  {
    if (this.headers == null)
      loadHeaders();
    return this.headers.getMatchingHeaderLines(paramArrayOfString);
  }

  public Enumeration getMatchingHeaders(String[] paramArrayOfString)
    throws MessagingException
  {
    if (this.headers == null)
      loadHeaders();
    return this.headers.getMatchingHeaders(paramArrayOfString);
  }

  public Enumeration getNonMatchingHeaderLines(String[] paramArrayOfString)
    throws MessagingException
  {
    if (this.headers == null)
      loadHeaders();
    return this.headers.getNonMatchingHeaderLines(paramArrayOfString);
  }

  public Enumeration getNonMatchingHeaders(String[] paramArrayOfString)
    throws MessagingException
  {
    if (this.headers == null)
      loadHeaders();
    return this.headers.getNonMatchingHeaders(paramArrayOfString);
  }

  public int getSize()
    throws MessagingException
  {
    try
    {
      try
      {
        if (this.msgSize >= 0)
        {
          int j = this.msgSize;
          return j;
        }
        if (this.msgSize < 0)
        {
          if (this.headers == null)
            loadHeaders();
          if (this.contentStream != null)
            this.msgSize = this.contentStream.available();
        }
        else
        {
          int i = this.msgSize;
          return i;
        }
      }
      finally
      {
      }
    }
    catch (EOFException localEOFException)
    {
      while (true)
      {
        this.folder.close(false);
        throw new FolderClosedException(this.folder, localEOFException.toString());
        this.msgSize = (this.folder.getProtocol().list(this.msgnum) - this.hdrSize);
      }
    }
    catch (IOException localIOException)
    {
      throw new MessagingException("error getting size", localIOException);
    }
  }

  public void invalidate(boolean paramBoolean)
  {
    try
    {
      this.content = null;
      this.contentStream = null;
      this.msgSize = -1;
      if (paramBoolean)
      {
        this.headers = null;
        this.hdrSize = -1;
      }
      return;
    }
    finally
    {
    }
  }

  public void removeHeader(String paramString)
    throws MessagingException
  {
    throw new IllegalWriteException("POP3 messages are read-only");
  }

  public void saveChanges()
    throws MessagingException
  {
    throw new IllegalWriteException("POP3 messages are read-only");
  }

  public void setFlags(Flags paramFlags, boolean paramBoolean)
    throws MessagingException
  {
    Flags localFlags = (Flags)this.flags.clone();
    super.setFlags(paramFlags, paramBoolean);
    if (!this.flags.equals(localFlags))
      this.folder.notifyMessageChangedListeners(1, this);
  }

  public void setHeader(String paramString1, String paramString2)
    throws MessagingException
  {
    throw new IllegalWriteException("POP3 messages are read-only");
  }

  public InputStream top(int paramInt)
    throws MessagingException
  {
    try
    {
      try
      {
        InputStream localInputStream = this.folder.getProtocol().top(this.msgnum, paramInt);
        return localInputStream;
      }
      finally
      {
      }
    }
    catch (EOFException localEOFException)
    {
      this.folder.close(false);
      throw new FolderClosedException(this.folder, localEOFException.toString());
    }
    catch (IOException localIOException)
    {
      throw new MessagingException("error getting size", localIOException);
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.pop3.POP3Message
 * JD-Core Version:    0.6.2
 */