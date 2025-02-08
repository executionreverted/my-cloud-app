"use client"

import { Button, Input, Stack, Textarea, Field, Wrap, Image, Text } from "@chakra-ui/react"
import {
  DrawerActionTrigger,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from "../ui/drawer"
import { useEffect, useRef, useState } from "react"
import useUI from "../../hooks/useUI"
import useUser from "../../hooks/useUser"
import { toaster } from "../ui/toaster"
import { BASE_AVATAR_URI } from "../../config/constants"
const EditProfile = () => {
  const ref = useRef<HTMLInputElement>(null)
  const { openEditProfile, setOpenEditProfile } = useUI()
  const { getProfile, updateProfile, wallet } = useUser()

  const [profile, setProfile] = useState(null)
  const [name, setName] = useState<string | null>("")
  const [status, setStatus] = useState<string | null>("")
  const [image, setImage] = useState<string | null>("")

  const hasImage = typeof profile?.image === "string"

  useEffect(() => {
    if (!wallet) return;
    fetchProfile()
  }, [wallet])

  const fetchProfile = async () => {
    const _profile = await getProfile()
    if (!_profile) {
      return;
    }
    setProfile(_profile)
    setName(_profile.name)
    setStatus(_profile.status)
    setImage(_profile.image)
  }

  const onFileChange = ({ files }: any) => {

    if (!files || files.length === 0) return

    // convert image to base64
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      console.log("base64", base64)
      setImage(base64.replace('data:image/jpeg;base64,', ''))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    console.log('TRIGGER SAVE')
    console.log(name, image, status, profile)
    try {
      await updateProfile({
        name: name || profile?.name,
        image: typeof image === "string" ? image : profile?.image,
        status: status || profile?.status
      })
      toaster.create({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        type: "success",
        duration: 1000,
        onStatusChange: () => {
          setOpenEditProfile(false)
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

  const getBorder = (imageName: string): string => {
    if (image == imageName) {
      return "2px solid green"
    } else if (profile?.image == imageName) {
      return "2px dashed orange.300"
    } else {
      return "2px solid black"
    }
  }

  return (
    profile ?
      <DrawerRoot open={openEditProfile} onOpenChange={(details) => setOpenEditProfile(details.open)} initialFocusEl={() => ref.current}>
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Profile</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <p>
              This is where you edit your slick, cool, neat, epic P2P profile! You profile is public and will be shown to everyone in the rooms you join. You can make your profile private any time from below.
            </p>

            {/* <Stack w={100} h={100} mt="4" mx="auto" alignItems={"center"}>
            <Avatar size={"full"} src={image ? 'data:image/jpeg;base64,' + image : profile?.image || ""} />
          </Stack> */}

            <Text fontSize={"sm"} color={"gray.500"}>
              Select your profile image
            </Text>
            <Wrap gap="0" mt="4">
              {Array.from({ length: 5 }).map((_, idx) => idx.toString()).map((_: string, index: number) => (
                <Image w={"80px"} h={"80px"} boxSizing={"border-box"} border={
                  getBorder(_)
                }
                  onClick={() => setImage(_)} src={`${BASE_AVATAR_URI}${_}.jpg`}
                  fit="cover"
                  alt="profile picture" />
              ))}
            </Wrap>

            {/* <FileUploadRoot mt="4" onFileAccept={onFileChange} mx="auto" allowDrop gap="1" maxWidth="300px">
            <FileUploadLabel>Upload profile image</FileUploadLabel>
            <FileInput />
          </FileUploadRoot> */}
            <Stack gap="4" mt="4">
              <Field.Root>
                <Field.Label>P2P Network Username</Field.Label>
                <Field.HelperText>This is your username on the P2P Network. It will be used to identify you to other peers.</Field.HelperText>
                <Input defaultValue={name} placeholder="P2P Network Username" onChange={(e) => setName(e.target.value)} />
              </Field.Root>
              <Field.Root>
                <Field.Label>Status</Field.Label>
                <Field.HelperText>This is your custom status on the P2P Network. It will be used to identify you to other peers.</Field.HelperText>
                <Textarea value={status} placeholder="Status" onChange={(e) => setStatus(e.target.value)} />
              </Field.Root>
            </Stack>
          </DrawerBody>
          <DrawerFooter>
            <DrawerActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerActionTrigger>
            <Button onClick={handleSave}>Save</Button>
          </DrawerFooter>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot> : <></>
  )
}

export default EditProfile