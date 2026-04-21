package org.apache.harmony.awt.datatransfer;

import java.awt.Image;
import java.awt.color.ColorSpace;
import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.SystemFlavorMap;
import java.awt.datatransfer.Transferable;
import java.awt.datatransfer.UnsupportedFlavorException;
import java.awt.image.BufferedImage;
import java.awt.image.ColorModel;
import java.awt.image.ComponentColorModel;
import java.awt.image.DataBufferByte;
import java.awt.image.DataBufferInt;
import java.awt.image.DataBufferUShort;
import java.awt.image.DirectColorModel;
import java.awt.image.Raster;
import java.awt.image.WritableRaster;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.io.Reader;
import java.io.StringReader;
import java.net.URL;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import org.apache.harmony.awt.internal.nls.Messages;

public final class DataProxy
  implements Transferable
{
  public static final Class[] charsetTextClasses = { [B.class, ByteBuffer.class, InputStream.class };
  public static final Class[] unicodeTextClasses = { String.class, Reader.class, CharBuffer.class, [C.class };
  private final DataProvider data;
  private final SystemFlavorMap flavorMap;

  public DataProxy(DataProvider paramDataProvider)
  {
    this.data = paramDataProvider;
    this.flavorMap = ((SystemFlavorMap)SystemFlavorMap.getDefaultFlavorMap());
  }

  private BufferedImage createBufferedImage(RawBitmap paramRawBitmap)
  {
    if ((paramRawBitmap == null) || (paramRawBitmap.buffer == null) || (paramRawBitmap.width <= 0) || (paramRawBitmap.height <= 0))
      return null;
    WritableRaster localWritableRaster;
    Object localObject;
    if ((paramRawBitmap.bits == 32) && ((paramRawBitmap.buffer instanceof int[])))
    {
      if ((!isRGB(paramRawBitmap)) && (!isBGR(paramRawBitmap)))
        return null;
      int[] arrayOfInt4 = new int[3];
      arrayOfInt4[0] = paramRawBitmap.rMask;
      arrayOfInt4[1] = paramRawBitmap.gMask;
      arrayOfInt4[2] = paramRawBitmap.bMask;
      int[] arrayOfInt5 = (int[])paramRawBitmap.buffer;
      DirectColorModel localDirectColorModel = new DirectColorModel(24, paramRawBitmap.rMask, paramRawBitmap.gMask, paramRawBitmap.bMask);
      localWritableRaster = Raster.createPackedRaster(new DataBufferInt(arrayOfInt5, arrayOfInt5.length), paramRawBitmap.width, paramRawBitmap.height, paramRawBitmap.stride, arrayOfInt4, null);
      localObject = localDirectColorModel;
    }
    while ((localObject == null) || (localWritableRaster == null))
    {
      return null;
      if ((paramRawBitmap.bits == 24) && ((paramRawBitmap.buffer instanceof byte[])))
      {
        int[] arrayOfInt2 = { 8, 8, 8 };
        int[] arrayOfInt3;
        if (isRGB(paramRawBitmap))
        {
          arrayOfInt3 = new int[3];
          arrayOfInt3[1] = 1;
          arrayOfInt3[2] = 2;
        }
        while (true)
        {
          byte[] arrayOfByte = (byte[])paramRawBitmap.buffer;
          localObject = new ComponentColorModel(ColorSpace.getInstance(1000), arrayOfInt2, false, false, 1, 0);
          localWritableRaster = Raster.createInterleavedRaster(new DataBufferByte(arrayOfByte, arrayOfByte.length), paramRawBitmap.width, paramRawBitmap.height, paramRawBitmap.stride, 3, arrayOfInt3, null);
          break;
          if (!isBGR(paramRawBitmap))
            break label324;
          arrayOfInt3 = new int[3];
          arrayOfInt3[0] = 2;
          arrayOfInt3[1] = 1;
        }
        label324: return null;
      }
      if (paramRawBitmap.bits != 16)
      {
        int i = paramRawBitmap.bits;
        localObject = null;
        localWritableRaster = null;
        if (i != 15);
      }
      else
      {
        boolean bool = paramRawBitmap.buffer instanceof short[];
        localObject = null;
        localWritableRaster = null;
        if (bool)
        {
          int[] arrayOfInt1 = new int[3];
          arrayOfInt1[0] = paramRawBitmap.rMask;
          arrayOfInt1[1] = paramRawBitmap.gMask;
          arrayOfInt1[2] = paramRawBitmap.bMask;
          short[] arrayOfShort = (short[])paramRawBitmap.buffer;
          localObject = new DirectColorModel(paramRawBitmap.bits, paramRawBitmap.rMask, paramRawBitmap.gMask, paramRawBitmap.bMask);
          localWritableRaster = Raster.createPackedRaster(new DataBufferUShort(arrayOfShort, arrayOfShort.length), paramRawBitmap.width, paramRawBitmap.height, paramRawBitmap.stride, arrayOfInt1, null);
        }
      }
    }
    return new BufferedImage((ColorModel)localObject, localWritableRaster, false, null);
  }

  private String getCharset(DataFlavor paramDataFlavor)
  {
    return paramDataFlavor.getParameter("charset");
  }

  private Object getFileList(DataFlavor paramDataFlavor)
    throws IOException, UnsupportedFlavorException
  {
    if (!this.data.isNativeFormatAvailable("application/x-java-file-list"))
      throw new UnsupportedFlavorException(paramDataFlavor);
    String[] arrayOfString = this.data.getFileList();
    if (arrayOfString == null)
      throw new IOException(Messages.getString("awt.4F"));
    return Arrays.asList(arrayOfString);
  }

  private Object getHTML(DataFlavor paramDataFlavor)
    throws IOException, UnsupportedFlavorException
  {
    if (!this.data.isNativeFormatAvailable("text/html"))
      throw new UnsupportedFlavorException(paramDataFlavor);
    String str = this.data.getHTML();
    if (str == null)
      throw new IOException(Messages.getString("awt.4F"));
    return getTextRepresentation(str, paramDataFlavor);
  }

  private Image getImage(DataFlavor paramDataFlavor)
    throws IOException, UnsupportedFlavorException
  {
    if (!this.data.isNativeFormatAvailable("image/x-java-image"))
      throw new UnsupportedFlavorException(paramDataFlavor);
    RawBitmap localRawBitmap = this.data.getRawBitmap();
    if (localRawBitmap == null)
      throw new IOException(Messages.getString("awt.4F"));
    return createBufferedImage(localRawBitmap);
  }

  private Object getPlainText(DataFlavor paramDataFlavor)
    throws IOException, UnsupportedFlavorException
  {
    if (!this.data.isNativeFormatAvailable("text/plain"))
      throw new UnsupportedFlavorException(paramDataFlavor);
    String str = this.data.getText();
    if (str == null)
      throw new IOException(Messages.getString("awt.4F"));
    return getTextRepresentation(str, paramDataFlavor);
  }

  private Object getSerializedObject(DataFlavor paramDataFlavor)
    throws IOException, UnsupportedFlavorException
  {
    String str = SystemFlavorMap.encodeDataFlavor(paramDataFlavor);
    if ((str == null) || (!this.data.isNativeFormatAvailable(str)))
      throw new UnsupportedFlavorException(paramDataFlavor);
    byte[] arrayOfByte = this.data.getSerializedObject(paramDataFlavor.getRepresentationClass());
    if (arrayOfByte == null)
      throw new IOException(Messages.getString("awt.4F"));
    ByteArrayInputStream localByteArrayInputStream = new ByteArrayInputStream(arrayOfByte);
    try
    {
      Object localObject = new ObjectInputStream(localByteArrayInputStream).readObject();
      return localObject;
    }
    catch (ClassNotFoundException localClassNotFoundException)
    {
      throw new IOException(localClassNotFoundException.getMessage());
    }
  }

  private Object getTextRepresentation(String paramString, DataFlavor paramDataFlavor)
    throws UnsupportedFlavorException, IOException
  {
    if (paramDataFlavor.getRepresentationClass() == String.class)
      return paramString;
    if (paramDataFlavor.isRepresentationClassReader())
      return new StringReader(paramString);
    if (paramDataFlavor.isRepresentationClassCharBuffer())
      return CharBuffer.wrap(paramString);
    if (paramDataFlavor.getRepresentationClass() == [C.class)
    {
      char[] arrayOfChar = new char[paramString.length()];
      paramString.getChars(0, paramString.length(), arrayOfChar, 0);
      return arrayOfChar;
    }
    String str = getCharset(paramDataFlavor);
    if (paramDataFlavor.getRepresentationClass() == [B.class)
      return paramString.getBytes(str);
    if (paramDataFlavor.isRepresentationClassByteBuffer())
      return ByteBuffer.wrap(paramString.getBytes(str));
    if (paramDataFlavor.isRepresentationClassInputStream())
      return new ByteArrayInputStream(paramString.getBytes(str));
    throw new UnsupportedFlavorException(paramDataFlavor);
  }

  private Object getURL(DataFlavor paramDataFlavor)
    throws IOException, UnsupportedFlavorException
  {
    if (!this.data.isNativeFormatAvailable("application/x-java-url"))
      throw new UnsupportedFlavorException(paramDataFlavor);
    String str = this.data.getURL();
    if (str == null)
      throw new IOException(Messages.getString("awt.4F"));
    URL localURL = new URL(str);
    if (paramDataFlavor.getRepresentationClass().isAssignableFrom(URL.class))
      return localURL;
    if (paramDataFlavor.isFlavorTextType())
      return getTextRepresentation(localURL.toString(), paramDataFlavor);
    throw new UnsupportedFlavorException(paramDataFlavor);
  }

  private boolean isBGR(RawBitmap paramRawBitmap)
  {
    return (paramRawBitmap.rMask == 255) && (paramRawBitmap.gMask == 65280) && (paramRawBitmap.bMask == 16711680);
  }

  private boolean isRGB(RawBitmap paramRawBitmap)
  {
    return (paramRawBitmap.rMask == 16711680) && (paramRawBitmap.gMask == 65280) && (paramRawBitmap.bMask == 255);
  }

  public DataProvider getDataProvider()
  {
    return this.data;
  }

  public Object getTransferData(DataFlavor paramDataFlavor)
    throws UnsupportedFlavorException, IOException
  {
    String str = paramDataFlavor.getPrimaryType() + "/" + paramDataFlavor.getSubType();
    if (paramDataFlavor.isFlavorTextType())
    {
      if (str.equalsIgnoreCase("text/html"))
        return getHTML(paramDataFlavor);
      if (str.equalsIgnoreCase("text/uri-list"))
        return getURL(paramDataFlavor);
      return getPlainText(paramDataFlavor);
    }
    if (paramDataFlavor.isFlavorJavaFileListType())
      return getFileList(paramDataFlavor);
    if (paramDataFlavor.isFlavorSerializedObjectType())
      return getSerializedObject(paramDataFlavor);
    if (paramDataFlavor.equals(DataProvider.urlFlavor))
      return getURL(paramDataFlavor);
    if ((str.equalsIgnoreCase("image/x-java-image")) && (Image.class.isAssignableFrom(paramDataFlavor.getRepresentationClass())))
      return getImage(paramDataFlavor);
    throw new UnsupportedFlavorException(paramDataFlavor);
  }

  public DataFlavor[] getTransferDataFlavors()
  {
    ArrayList localArrayList = new ArrayList();
    String[] arrayOfString = this.data.getNativeFormats();
    int i = 0;
    if (i >= arrayOfString.length)
      return (DataFlavor[])localArrayList.toArray(new DataFlavor[localArrayList.size()]);
    Iterator localIterator = this.flavorMap.getFlavorsForNative(arrayOfString[i]).iterator();
    while (true)
    {
      if (!localIterator.hasNext())
      {
        i++;
        break;
      }
      DataFlavor localDataFlavor = (DataFlavor)localIterator.next();
      if (!localArrayList.contains(localDataFlavor))
        localArrayList.add(localDataFlavor);
    }
  }

  public boolean isDataFlavorSupported(DataFlavor paramDataFlavor)
  {
    DataFlavor[] arrayOfDataFlavor = getTransferDataFlavors();
    for (int i = 0; ; i++)
    {
      if (i >= arrayOfDataFlavor.length)
        return false;
      if (arrayOfDataFlavor[i].equals(paramDataFlavor))
        return true;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.apache.harmony.awt.datatransfer.DataProxy
 * JD-Core Version:    0.6.2
 */