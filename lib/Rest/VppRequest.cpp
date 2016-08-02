////////////////////////////////////////////////////////////////////////////////
/// DISCLAIMER
///
/// Copyright 2014-2016 ArangoDB GmbH, Cologne, Germany
/// Copyright 2004-2014 triAGENS GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is ArangoDB GmbH, Cologne, Germany
///
/// @author Jan Christoph Uhde
////////////////////////////////////////////////////////////////////////////////

#include "VppRequest.h"

#include <velocypack/Builder.h>
#include <velocypack/Iterator.h>
#include <velocypack/Options.h>
#include <velocypack/Parser.h>
#include <velocypack/Validator.h>
#include <velocypack/velocypack-aliases.h>

#include "Basics/conversions.h"
#include "Basics/StaticStrings.h"
#include "Basics/StringUtils.h"
#include "Basics/tri-strings.h"
#include "Logger/Logger.h"

using namespace arangodb;
using namespace arangodb::basics;

namespace {
std::string const& lookupStringInMap(
    std::unordered_map<std::string, std::string> const& map,
    std::string const& key, bool& found) {
  auto it = map.find(key);
  if (it != map.end()) {
    found = true;
    return it->second;
  }

  found = false;
  return StaticStrings::Empty;
}
}

VppRequest::VppRequest(ConnectionInfo const& connectionInfo,
                       VPackMessage&& message)
    : GeneralRequest(connectionInfo),
      _message(std::move(message)),
      _headers(nullptr) {
  if (message._payload != VPackSlice::noneSlice()) {
    _contentType = ContentType::VPACK;
    _contentTypeResponse = ContentType::VPACK;
    _protocol = "vpp";
    parseHeaderInformation();
  }
}

VPackSlice VppRequest::payload(VPackOptions const* options) {
  // TODO - handle options??
  return _message._payload;
}

std::unordered_map<std::string, std::string> const& VppRequest::headers()
    const {
  if (!_headers) {
    using namespace std;
    _headers = make_unique<unordered_map<string, string>>();
    TRI_ASSERT(_message._header.isObject());
    for (auto const& it : VPackObjectIterator(_message._header)) {
      _headers->emplace(it.key.copyString(), it.value.copyString());
    }
  }
  return *_headers;
}

std::string const& VppRequest::header(std::string const& key,
                                      bool& found) const {
  headers();
  return lookupStringInMap(*_headers, key, found);
}

std::string const& VppRequest::header(std::string const& key) const {
  bool unused = true;
  return header(key, unused);
}

void VppRequest::parseHeaderInformation() {
  using namespace std;
  TRI_ASSERT(_message._header.isObject());
  VPackSlice params = _message._header.get("parameter");
  TRI_ASSERT(params.isObject());
  for (auto const& it : VPackObjectIterator(params)) {
    if (it.value.isArray()) {
      vector<string> tmp;
      for (auto const& itInner : VPackArrayIterator(it.value)) {
        tmp.emplace_back(itInner.copyString());
      }
      _arrayValues.emplace(it.key.copyString(), move(tmp));
    } else {
      _values.emplace(it.key.copyString(), it.value.copyString());
    }
  }
}

std::string const& VppRequest::value(std::string const& key,
                                     bool& found) const {
  return lookupStringInMap(_values, key, found);
}

std::string const& VppRequest::value(std::string const& key) const {
  bool unused = true;
  return value(key, unused);
}
