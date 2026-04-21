package javax.mail;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Vector;

public abstract class Multipart
{
  protected String contentType = "multipart/mixed";
  protected Part parent;
  protected Vector parts = new Vector();

  public void addBodyPart(BodyPart paramBodyPart)
    throws MessagingException
  {
    try
    {
      if (this.parts == null)
        this.parts = new Vector();
      this.parts.addElement(paramBodyPart);
      paramBodyPart.setParent(this);
      return;
    }
    finally
    {
    }
  }

  public void addBodyPart(BodyPart paramBodyPart, int paramInt)
    throws MessagingException
  {
    try
    {
      if (this.parts == null)
        this.parts = new Vector();
      this.parts.insertElementAt(paramBodyPart, paramInt);
      paramBodyPart.setParent(this);
      return;
    }
    finally
    {
    }
  }

  public BodyPart getBodyPart(int paramInt)
    throws MessagingException
  {
    try
    {
      if (this.parts == null)
        throw new IndexOutOfBoundsException("No such BodyPart");
    }
    finally
    {
    }
    BodyPart localBodyPart = (BodyPart)this.parts.elementAt(paramInt);
    return localBodyPart;
  }

  public String getContentType()
  {
    return this.contentType;
  }

  public int getCount()
    throws MessagingException
  {
    try
    {
      Vector localVector = this.parts;
      if (localVector == null);
      int i;
      for (int j = 0; ; j = i)
      {
        return j;
        i = this.parts.size();
      }
    }
    finally
    {
    }
  }

  public Part getParent()
  {
    try
    {
      Part localPart = this.parent;
      return localPart;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void removeBodyPart(int paramInt)
    throws MessagingException
  {
    try
    {
      if (this.parts == null)
        throw new IndexOutOfBoundsException("No such BodyPart");
    }
    finally
    {
    }
    BodyPart localBodyPart = (BodyPart)this.parts.elementAt(paramInt);
    this.parts.removeElementAt(paramInt);
    localBodyPart.setParent(null);
  }

  public boolean removeBodyPart(BodyPart paramBodyPart)
    throws MessagingException
  {
    try
    {
      if (this.parts == null)
        throw new MessagingException("No such body part");
    }
    finally
    {
    }
    boolean bool = this.parts.removeElement(paramBodyPart);
    paramBodyPart.setParent(null);
    return bool;
  }

  protected void setMultipartDataSource(MultipartDataSource paramMultipartDataSource)
    throws MessagingException
  {
    try
    {
      this.contentType = paramMultipartDataSource.getContentType();
      int i = paramMultipartDataSource.getCount();
      for (int j = 0; ; j++)
      {
        if (j >= i)
          return;
        addBodyPart(paramMultipartDataSource.getBodyPart(j));
      }
    }
    finally
    {
    }
  }

  public void setParent(Part paramPart)
  {
    try
    {
      this.parent = paramPart;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public abstract void writeTo(OutputStream paramOutputStream)
    throws IOException, MessagingException;
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.Multipart
 * JD-Core Version:    0.6.2
 */